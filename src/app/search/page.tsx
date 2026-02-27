"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import SolutionCard from "@/components/SolutionCard";
import CrowdVote from "@/components/CrowdVote";
import FreshnessBadge from "@/components/FreshnessBadge";
import CompanyLogo from "@/components/CompanyLogo";

interface SearchResultItem {
  center: {
    id: string;
    name: string;
    category: string;
    tel: string | null;
    tel_short: string | null;
    hours: string;
    satisfaction: number;
    freshness: {
      last_verified: string;
      verified_by: number;
      reports_incorrect: number;
      status: string;
    };
  };
  matchType: string;
  purpose: string | null;
  solution: {
    type: "no_call" | "call" | "both";
    title: string;
    description: string;
    steps?: string[];
    arsPath?: string;
    alternative?: {
      type: string;
      name: string;
      path?: string;
      url?: string | null;
    };
    estimatedWait?: number | null;
    bestTime?: string;
  } | null;
  confidence: number;
}

/* AI 메시지 타입 */
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"results" | "ai">("results");

  /* AI 채팅 상태 */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
        if ((data.results || []).length === 0) {
          setActiveView("ai");
        }
      })
      .catch(() => setLoading(false));
  }, [query]);

  /* 최근 검색 저장 */
  useEffect(() => {
    if (!query) return;
    try {
      const saved = JSON.parse(localStorage.getItem("qzero_recent") || "[]") as string[];
      const updated = [query, ...saved.filter((s) => s !== query)].slice(0, 20);
      localStorage.setItem("qzero_recent", JSON.stringify(updated));
    } catch { /* noop */ }
  }, [query]);

  /* AI 스트리밍 전송 */
  const sendAI = async (text: string) => {
    if (!text.trim() || streaming) return;
    const userMsg: ChatMessage = { role: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setAiInput("");
    setStreaming(true);

    const assistantMsg: ChatMessage = { role: "assistant", text: "" };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "complex_resolution", query: text.trim() }),
      });

      if (!res.ok) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", text: "죄송해요, 응답을 받지 못했어요. 다시 시도해주세요." };
          return copy;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) { setStreaming(false); return; }
      const decoder = new TextDecoder();
      let buffer = "";

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
                setMessages((prev) => {
                  const copy = [...prev];
                  copy[copy.length - 1] = {
                    role: "assistant",
                    text: copy[copy.length - 1].text + parsed.text,
                  };
                  return copy;
                });
              }
            } catch { /* ignore */ }
          }
        }
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = { role: "assistant", text: "네트워크 오류가 발생했어요." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F4F5F7] transition-colors shrink-0"
          >
            <svg className="w-5 h-5 text-[#191F28]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <SearchBar initialValue={query} size="sm" />
          </div>
        </div>

        {/* View toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView("results")}
            className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all tracking-[-0.3px] ${
              activeView === "results"
                ? "bg-[#191F28] text-white"
                : "bg-[#F4F5F7] text-[#8B95A1]"
            }`}
          >
            검색 결과{!loading && results.length > 0 ? ` ${results.length}` : ""}
          </button>
          <button
            onClick={() => setActiveView("ai")}
            className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center justify-center gap-1.5 tracking-[-0.3px] ${
              activeView === "ai"
                ? "bg-gradient-to-r from-[#00E59B] to-[#00C785] text-white"
                : "bg-[#F4F5F7] text-[#8B95A1]"
            }`}
          >
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-extrabold ${
              activeView === "ai" ? "bg-white/20" : "bg-[#EAEBEE]"
            }`}>Q</span>
            Q헬퍼
          </button>
        </div>
      </div>

      {/* Results View */}
      {activeView === "results" && (
        <div className="px-5 pt-4 pb-8 flex-1">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#EAEBEE] border-t-[#3182F6] rounded-full animate-spin mb-3" />
              <p className="text-[14px] text-[#8B95A1]">검색 중...</p>
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="space-y-3">
              {/* AI 한 줄 요약 */}
              <button
                onClick={() => {
                  setActiveView("ai");
                  if (messages.length === 0) sendAI(query);
                }}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all text-left"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white text-[10px] font-extrabold">Q</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#191F28]">Q헬퍼가 더 자세히 안내해드릴까요?</p>
                  <p className="text-[12px] text-[#8B95A1] mt-0.5">AI가 맞춤 해결책을 찾아줘요</p>
                </div>
                <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {results.slice(0, 5).map((result) => (
                <div key={result.center.id} className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
                  <button
                    onClick={() => router.push(`/center/${result.center.id}`)}
                    className="flex items-center gap-3 p-5 pb-3 w-full text-left"
                  >
                    <CompanyLogo centerId={result.center.id} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{result.center.name}</h2>
                        <span className="text-[12px] text-[#8B95A1]">{result.center.category}</span>
                      </div>
                      <div className="mt-1">
                        <FreshnessBadge freshness={result.center.freshness} />
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {result.solution && (
                    <div className="px-4 pb-4">
                      <SolutionCard solution={result.solution} center={result.center} />
                    </div>
                  )}
                  <div className="px-5 pb-4">
                    <CrowdVote centerId={result.center.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && results.length === 0 && query && (
            <div className="text-center py-16">
              <p className="text-[16px] font-semibold text-[#4E5968] mb-1">검색 결과가 없어요</p>
              <p className="text-[14px] text-[#8B95A1] mb-5">Q헬퍼에게 직접 물어보세요</p>
              <button
                onClick={() => {
                  setActiveView("ai");
                  if (messages.length === 0) sendAI(query);
                }}
                className="px-6 py-3 bg-[#191F28] text-white text-[14px] font-semibold rounded-[12px] hover:bg-[#0F1419] transition-colors inline-flex items-center gap-2"
              >
                <span className="w-5 h-5 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-md flex items-center justify-center text-[8px] font-extrabold text-white">Q</span>
                Q헬퍼에게 물어보기
              </button>
            </div>
          )}
        </div>
      )}

      {/* AI Chat View — Multi-turn */}
      {activeView === "ai" && (
        <div className="flex-1 flex flex-col">
          {/* Chat area */}
          <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-4">
            {messages.length === 0 && !streaming && (
              <div className="text-center py-12">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-2xl flex items-center justify-center">
                  <span className="text-white text-[14px] font-extrabold">Q</span>
                </div>
                <p className="text-[16px] font-bold text-[#191F28] mb-1">Q헬퍼</p>
                <p className="text-[14px] text-[#8B95A1] mb-6">고객센터 문제, 뭐든 물어보세요</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    `"${query}" 해결 방법`,
                    "전화 없이 해결하려면?",
                    "상담원에게 뭐라고 말해야 해?",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendAI(suggestion)}
                      className="px-3.5 py-2 bg-white rounded-xl text-[13px] text-[#4E5968] font-medium shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-lg flex items-center justify-center shrink-0 mr-2 mt-0.5">
                    <span className="text-white text-[8px] font-bold">Q</span>
                  </div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-[#191F28] text-white"
                    : "bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
                }`}>
                  <p className={`text-[14px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user" ? "text-white" : "text-[#4E5968]"
                  }`}>
                    {msg.text}
                    {streaming && i === messages.length - 1 && msg.role === "assistant" && (
                      <span className="inline-block w-0.5 h-4 bg-[#3182F6] animate-pulse ml-0.5 align-text-bottom" />
                    )}
                  </p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat input */}
          <div className="shrink-0 bg-white border-t border-[#F2F3F5] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <div className="flex items-end gap-2">
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="메시지를 입력하세요..."
                rows={1}
                className="flex-1 px-4 py-2.5 bg-[#F4F5F7] rounded-2xl text-[14px] text-[#191F28] placeholder-[#B0B8C1] resize-none focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 max-h-[120px]"
                style={{ minHeight: "40px" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendAI(aiInput);
                  }
                }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "40px";
                  t.style.height = Math.min(t.scrollHeight, 120) + "px";
                }}
              />
              <button
                onClick={() => sendAI(aiInput)}
                disabled={!aiInput.trim() || streaming}
                className="w-10 h-10 rounded-xl bg-[#3182F6] text-white flex items-center justify-center hover:bg-[#1B64DA] disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0"
              >
                {streaming ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-[#F4F5F7]">
        <div className="w-8 h-8 border-2 border-[#EAEBEE] border-t-[#3182F6] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
