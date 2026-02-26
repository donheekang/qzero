"use client";

import { useState } from "react";

type AITab = "guide" | "analysis" | "script";

interface AIAssistantProps {
  centerId: string;
  centerName: string;
}

export default function AIAssistant({ centerId, centerName }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<AITab>("guide");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tabs: { id: AITab; label: string; desc: string }[] = [
    { id: "guide", label: "상담 가이드", desc: "최적의 상담 경로 안내" },
    { id: "analysis", label: "문제 분석", desc: "예상 해결책과 소요시간" },
    { id: "script", label: "스크립트", desc: "상담원에게 할 말 생성" },
  ];

  const placeholders: Record<AITab, string> = {
    guide: `${centerName}에 어떤 문제로 전화하시나요?`,
    analysis: "겪고 있는 문제를 자세히 설명해주세요",
    script: "상담원에게 어떤 내용을 전달하고 싶으세요?",
  };

  // 탭별로 API type 매핑
  const typeMap: Record<AITab, string> = {
    guide: "complex_resolution",
    analysis: "intent_analysis",
    script: "custom_script",
  };

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeMap[activeTab],
          query: query.trim(),
          centerId,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // intent_analysis는 structured 데이터를 보기 좋게 포맷
        if (activeTab === "analysis" && data.structured) {
          const s = data.structured;
          const formatted = [
            s.summary && `문제 요약: ${s.summary}`,
            s.purpose && `목적: ${s.purpose}`,
            s.urgency && `긴급도: ${s.urgency === "high" ? "높음" : s.urgency === "medium" ? "보통" : "낮음"}`,
            "",
            data.content,
          ]
            .filter(Boolean)
            .join("\n");
          setResult(formatted);
        } else {
          setResult(data.content);
        }
      } else {
        setError(data.error || "AI 응답을 가져올 수 없습니다.");
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: AITab) => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-5 h-5 bg-[#00E59B] rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        AI 어시스턴트
      </h2>

      {/* Tabs */}
      <div className="flex gap-2 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-[#00E59B] text-white"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs text-gray-400 mb-3">
        {tabs.find((t) => t.id === activeTab)?.desc}
      </p>

      {/* Input */}
      <div className="relative mb-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[activeTab]}
          rows={3}
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#00E59B] focus:border-transparent"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={!query.trim() || loading}
        className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-700"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            AI 분석 중...
          </span>
        ) : (
          "AI에게 물어보기"
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-3 px-4 py-3 bg-red-50 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-3 px-4 py-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-4 h-4 bg-[#00E59B] rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span className="text-xs font-semibold text-gray-500">AI 응답</span>
          </div>
          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {result}
          </div>

          {/* Copy button */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(result);
            }}
            className="mt-3 text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            복사하기
          </button>
        </div>
      )}
    </div>
  );
}
