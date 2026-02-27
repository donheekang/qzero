"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ── Types ── */
interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "요금제 변경하려면 어떻게 해?",
  "전화 없이 해지하는 방법",
  "상담원 연결 빨리 하는 팁",
  "환불 요청 멘트 만들어줘",
  "인터넷 해지 위약금 알려줘",
  "카드 분실 신고 방법",
];

const MODE_OPTIONS = [
  {
    id: "guide" as const,
    type: "complex_resolution",
    label: "상담 가이드",
    desc: "최적의 해결 경로 안내",
    icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    id: "script" as const,
    type: "custom_script",
    label: "상담 멘트",
    desc: "전화할 때 할 말 생성",
    icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z",
  },
  {
    id: "coaching" as const,
    type: "cancellation_coaching",
    label: "해지 코칭",
    desc: "해지 방어팀 대응법",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    id: "complaint" as const,
    type: "complaint_draft",
    label: "민원 대필",
    desc: "소비자보호법 근거 작성",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
];

export default function HelperPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [mode, setMode] = useState(MODE_OPTIONS[0]);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /* 대화 히스토리 로드 */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("qzero_chat_history");
      if (saved) {
        const parsed = JSON.parse(saved) as ChatMessage[];
        // 최근 24시간 이내 대화만 복원
        const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
        const recent = parsed.filter((m) => m.timestamp > dayAgo);
        if (recent.length > 0) setMessages(recent);
      }
    } catch { /* noop */ }
  }, []);

  /* 대화 히스토리 저장 */
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem("qzero_chat_history", JSON.stringify(messages.slice(-50)));
      } catch { /* noop */ }
    }
  }, [messages]);

  /* 자동 스크롤 */
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: ChatMessage = { role: "user", text: text.trim(), timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);

    // textarea 높이 리셋
    if (inputRef.current) {
      inputRef.current.style.height = "40px";
    }

    const assistantMsg: ChatMessage = { role: "assistant", text: "", timestamp: Date.now() };
    setMessages((prev) => [...prev, assistantMsg]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: mode.type, query: text.trim() }),
      });

      if (!res.ok) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { ...copy[copy.length - 1], text: "죄송해요, 응답을 받지 못했어요. 다시 시도해주세요." };
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
                    ...copy[copy.length - 1],
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
        copy[copy.length - 1] = { ...copy[copy.length - 1], text: "네트워크 오류가 발생했어요. 다시 시도해주세요." };
        return copy;
      });
    } finally {
      setStreaming(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("qzero_chat_history");
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col">
      {/* Header */}
      <header className="bg-white px-5 pt-4 pb-3 flex items-center justify-between shrink-0 border-b border-[#F2F3F5]">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => router.push("/")}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#F4F5F7] transition-colors"
          >
            <svg className="w-5 h-5 text-[#191F28]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="w-7 h-7 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-lg flex items-center justify-center">
            <span className="text-white text-[9px] font-extrabold">Q</span>
          </div>
          <span className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">Q헬퍼</span>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="px-3 py-1.5 text-[12px] font-medium text-[#8B95A1] hover:text-[#F04452] transition-colors rounded-lg hover:bg-[#FFF0F0]"
            >
              새 대화
            </button>
          )}
        </div>
      </header>

      {/* Mode selector */}
      <div className="bg-white px-5 py-2.5 shrink-0 border-b border-[#F2F3F5]">
        <button
          onClick={() => setShowModeSelector(!showModeSelector)}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#F4F5F7] rounded-lg text-[13px] font-medium text-[#4E5968] hover:bg-[#EAEBEE] transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mode.icon} />
          </svg>
          {mode.label}
          <svg className={`w-3 h-3 transition-transform ${showModeSelector ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showModeSelector && (
          <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
            {MODE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { setMode(opt); setShowModeSelector(false); }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all ${
                  mode.id === opt.id
                    ? "bg-[#191F28] text-white"
                    : "bg-[#F4F5F7] text-[#4E5968] hover:bg-[#EAEBEE]"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={opt.icon} />
                </svg>
                <div>
                  <p className="text-[13px] font-semibold">{opt.label}</p>
                  <p className={`text-[11px] mt-0.5 ${mode.id === opt.id ? "text-white/60" : "text-[#B0B8C1]"}`}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="text-center py-8">
            <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-2xl flex items-center justify-center">
              <span className="text-white text-[16px] font-extrabold">Q</span>
            </div>
            <p className="text-[18px] font-bold text-[#191F28] mb-1">무엇이든 물어보세요</p>
            <p className="text-[14px] text-[#8B95A1] mb-6">고객센터 문제 해결을 도와드릴게요</p>
            <div className="space-y-2 max-w-[300px] mx-auto">
              {SUGGESTIONS.slice(0, 4).map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => sendMessage(suggestion)}
                  className="w-full px-4 py-3 bg-white rounded-2xl text-[13px] text-[#4E5968] font-medium text-left shadow-[0_1px_4px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-all"
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
              {/* Copy button for assistant messages */}
              {msg.role === "assistant" && msg.text && !(streaming && i === messages.length - 1) && (
                <button
                  onClick={() => navigator.clipboard.writeText(msg.text)}
                  className="mt-2 text-[12px] text-[#B0B8C1] hover:text-[#4E5968] flex items-center gap-1 transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  복사
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border-t border-[#F2F3F5] px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`${mode.label} 모드 — 메시지를 입력하세요`}
            rows={1}
            className="flex-1 px-4 py-2.5 bg-[#F4F5F7] rounded-2xl text-[14px] text-[#191F28] placeholder-[#B0B8C1] resize-none focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 max-h-[120px]"
            style={{ minHeight: "40px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "40px";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || streaming}
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
  );
}
