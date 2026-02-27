"use client";

import { useState, useRef } from "react";

type AITab = "guide" | "analysis" | "script";

interface AIAssistantProps {
  centerId?: string;
  centerName?: string;
  initialQuery?: string;
  compact?: boolean;
}

export default function AIAssistant({ centerId, centerName, initialQuery = "", compact = false }: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<AITab>("guide");
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  const tabs: { id: AITab; label: string; icon: string; desc: string }[] = [
    { id: "guide", label: "상담 가이드", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", desc: "최적의 상담 경로를 안내해요" },
    { id: "analysis", label: "문제 분석", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", desc: "문제를 분석하고 해결책을 알려줘요" },
    { id: "script", label: "상담 멘트", icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z", desc: "상담원에게 할 말을 만들어줘요" },
  ];

  const placeholders: Record<AITab, string> = {
    guide: centerName ? `${centerName}에 어떤 문제로 전화하시나요?` : "어떤 고객센터 문제가 있으신가요?",
    analysis: "겪고 있는 문제를 자세히 설명해주세요",
    script: centerName ? "상담원에게 어떤 내용을 전달하고 싶으세요?" : "어떤 상담을 하고 싶으세요?",
  };

  const typeMap: Record<AITab, string> = {
    guide: "complex_resolution",
    analysis: "intent_analysis",
    script: "custom_script",
  };

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setStreaming(true);
    setResult("");
    setError(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: typeMap[activeTab],
          query: query.trim(),
          ...(centerId ? { centerId } : {}),
        }),
      });

      // 에러 응답 (JSON)
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "오류 발생" }));
        setError(data.error || "Q헬퍼가 응답할 수 없습니다.");
        setLoading(false);
        setStreaming(false);
        return;
      }

      // 스트리밍 응답 (SSE)
      const reader = res.body?.getReader();
      if (!reader) {
        setError("스트리밍을 시작할 수 없습니다.");
        setLoading(false);
        setStreaming(false);
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      setLoading(false); // 첫 글자가 오면 로딩 해제

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                setResult(prev => prev + parsed.text);
                // Auto-scroll to bottom of result
                requestAnimationFrame(() => {
                  resultRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
                });
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  };

  const handleTabChange = (tab: AITab) => {
    setActiveTab(tab);
    setResult("");
    setError(null);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={compact ? "" : "mb-6"}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">Q</span>
          </div>
          <div>
            <h2 className="text-[14px] font-bold text-[#191F28]">Q헬퍼</h2>
            <p className="text-[12px] text-[#8B95A1]">AI가 고객센터 상담을 도와드려요</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1.5 mb-3 bg-[#F4F5F7] rounded-[16px] p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[14px] font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white text-[#191F28] shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                : "text-[#8B95A1] hover:text-[#4E5968]"
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab description */}
      <p className="text-[12px] text-[#8B95A1] mb-2">
        {tabs.find((t) => t.id === activeTab)?.desc}
      </p>

      {/* Input area */}
      <div className="relative mb-3">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholders[activeTab]}
          rows={2}
          className="w-full px-4 py-3 pr-12 bg-white border border-[#EAEBEE] rounded-[16px] text-[14px] text-[#191F28] placeholder-[#B0B8C1] resize-none focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-all"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || loading || streaming}
          className="absolute right-2.5 bottom-2.5 w-8 h-8 rounded-[12px] bg-[#3182F6] text-white flex items-center justify-center hover:bg-[#1B64DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 px-4 py-3 bg-[#FFF0F0] rounded-[16px] border border-[#FFF0F0]">
          <p className="text-[14px] text-[#F04452]">{error}</p>
        </div>
      )}

      {/* Result - streaming */}
      {(result || loading) && (
        <div ref={resultRef} className="mt-3 bg-white rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#F4F5F7]">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-md flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">Q</span>
              </div>
              <span className="text-[14px] font-medium text-[#191F28]">
                {streaming ? "Q헬퍼 답변 중..." : "Q헬퍼 답변"}
              </span>
              {streaming && (
                <span className="w-1.5 h-1.5 bg-[#3182F6] rounded-full animate-pulse" />
              )}
            </div>
            {result && !streaming && (
              <button
                onClick={handleCopy}
                className="text-[14px] text-[#8B95A1] hover:text-[#4E5968] flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-[#3182F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    복사됨
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    복사
                  </>
                )}
              </button>
            )}
          </div>
          {/* Result body */}
          <div className="px-4 py-4">
            {loading && !result ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-[#E5F3FF] border-t-[#3182F6] rounded-full animate-spin" />
                <span className="text-[14px] text-[#8B95A1]">Q헬퍼가 분석 중...</span>
              </div>
            ) : (
              <div className="text-[14px] text-[#4E5968] whitespace-pre-wrap leading-relaxed">
                {result}
                {streaming && <span className="inline-block w-0.5 h-4 bg-[#3182F6] animate-pulse ml-0.5 align-text-bottom" />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
