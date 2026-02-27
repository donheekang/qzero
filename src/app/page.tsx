"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import InlineResults from "@/components/InlineResults";
import AIAssistant from "@/components/AIAssistant";
import CompanyLogo from "@/components/CompanyLogo";

/* ── Types ── */
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

/* ── Data: Problem-centric (NOT company-centric) ── */
const QUICK_PROBLEMS = [
  { q: "요금제 변경", l: "요금제 변경" },
  { q: "해지 방법", l: "해지 방법" },
  { q: "카드 한도", l: "카드 한도" },
  { q: "환불 반품", l: "환불/반품" },
  { q: "비밀번호 변경", l: "비밀번호" },
  { q: "배송 조회", l: "배송 조회" },
];

const AI_ACTIONS = [
  {
    label: "전화 없이 해결",
    desc: "앱/웹으로 바로 해결 가능한 방법 찾기",
    q: "전화 없이 해결하는 방법",
    color: "bg-[#E8FAF0]",
    icon: (
      <svg width="18" height="18" fill="none" stroke="#00C785" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: "상담 멘트 생성",
    desc: "상담원에게 할 말을 만들어줘요",
    q: "상담 멘트 만들어줘",
    color: "bg-[#E8F3FF]",
    icon: (
      <svg width="18" height="18" fill="none" stroke="#3182F6" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
  {
    label: "해지 방어 코칭",
    desc: "유지팀 대응법, 할인 협상 팁",
    q: "해지 방어 코칭",
    color: "bg-[#FFF5E0]",
    icon: (
      <svg width="18" height="18" fill="none" stroke="#F59F00" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "민원 대필",
    desc: "소비자보호법 근거 자동 작성",
    q: "민원 대필",
    color: "bg-[#F3EDFF]",
    icon: (
      <svg width="18" height="18" fill="none" stroke="#7C3AED" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const TRENDING = [
  { q: "SKT 요금제 변경", l: "SKT 요금제 변경", d: "T월드 앱에서 3분 해결", badge: "전화 불필요", badgeType: "green" as const },
  { q: "삼성카드 한도 상향", l: "삼성카드 한도 상향", d: "ARS 1→3번 빠른 연결", badge: "대기 2분", badgeType: "blue" as const },
  { q: "쿠팡 환불", l: "쿠팡 환불 방법", d: "앱에서 바로 처리 가능", badge: "전화 불필요", badgeType: "green" as const },
];

const POPULAR = [
  { id: "skt", name: "SKT" },
  { id: "kt", name: "KT" },
  { id: "lguplus", name: "LG U+" },
  { id: "kbbank", name: "국민은행" },
  { id: "shinhanbank", name: "신한은행" },
  { id: "samsungcard", name: "삼성카드" },
  { id: "coupang", name: "쿠팡" },
  { id: "nhis", name: "건강보험" },
];

/* ══════════════════════════════════════
   Home Component — AI-First Design
   ══════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearched(true);
    setLoading(true);
    setShowAI(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.results || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleAIClick = () => {
    setShowAI(true);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ━━━ Header ━━━ */}
      <header className="px-5 pt-[14px] pb-2 flex items-center justify-between">
        <div className="flex items-baseline gap-[1px]">
          <span className="text-[22px] font-extrabold tracking-[-0.8px] text-brand-gradient">Q</span>
          <span className="text-[22px] font-extrabold tracking-[-0.8px] text-[#191F28]">zero</span>
        </div>
        {searched ? (
          <button
            onClick={() => { setSearched(false); setResults([]); setSearchQuery(""); }}
            className="w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center press"
          >
            <svg className="w-4 h-4 text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <button className="w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="3.5" />
              <path strokeLinecap="round" d="M6.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
            </svg>
          </button>
        )}
      </header>

      {/* ━━━ Hero — AI First greeting ━━━ */}
      {!searched && (
        <div className="px-5 pt-2 pb-1 relative overflow-hidden">
          <div className="absolute -top-[60px] -right-[40px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(0,229,155,0.08)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute -bottom-[40px] -left-[40px] w-[160px] h-[160px] bg-[radial-gradient(circle,rgba(49,130,246,0.06)_0%,transparent_70%)] pointer-events-none" />
          <div className="mb-6 relative z-[1]">
            <p className="text-[14px] text-[#8B95A1] font-medium mb-[6px]">고객센터 때문에 스트레스 받지 마세요</p>
            <p className="text-[24px] font-extrabold text-[#191F28] tracking-[-0.8px] leading-[1.35]">
              어떤 <span className="text-brand-gradient">문제</span>를<br />해결해드릴까요?
            </p>
          </div>
        </div>
      )}

      {/* ━━━ Search ━━━ */}
      <div className="px-5 pt-1 pb-3">
        <SearchBar
          autoFocus
          size={searched ? "sm" : "lg"}
          onSearch={handleSearch}
          placeholder="요금 비싸서 해지하고 싶어요"
        />
      </div>

      {/* ━━━ Search Results ━━━ */}
      {searched && (
        <div ref={resultsRef} className="bg-[#F4F5F7] min-h-[60vh] px-5 pt-4 pb-8">
          <InlineResults results={results} loading={loading} query={searchQuery} onAIClick={handleAIClick} />
          {(showAI || (!loading && results.length > 0)) && (
            <div className="mt-4 bg-white rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 animate-slide-up">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-lg flex items-center justify-center">
                  <span className="text-white text-[9px] font-extrabold">Q</span>
                </div>
                <span className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">Q헬퍼에게 물어보기</span>
              </div>
              <AIAssistant initialQuery={searchQuery} compact />
            </div>
          )}
        </div>
      )}

      {/* ━━━ Home Content — AI First ━━━ */}
      {!searched && (
        <>
          {/* Problem-centric quick chips */}
          <div className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide">
            {QUICK_PROBLEMS.map((item) => (
              <button
                key={item.q}
                onClick={() => handleSearch(item.q)}
                className="flex-shrink-0 px-3.5 py-[7px] rounded-full text-[13px] font-medium text-[#4E5968] bg-[#F4F5F7] hover:bg-[#EAEBEE] transition-colors press"
              >
                {item.l}
              </button>
            ))}
          </div>

          {/* AI Quick Actions — 2x2 grid */}
          <section className="px-5 pb-5">
            <div className="grid grid-cols-2 gap-[10px]">
              {AI_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleSearch(action.q)}
                  className="bg-white border border-[#F0F1F3] rounded-2xl p-4 text-left hover:border-[#3182F6] hover:shadow-[0_2px_12px_rgba(49,130,246,0.08)] transition-all press"
                >
                  <div className={`w-9 h-9 rounded-xl ${action.color} flex items-center justify-center mb-[10px]`}>
                    {action.icon}
                  </div>
                  <p className="text-[14px] font-bold text-[#191F28] tracking-[-0.3px] mb-[3px]">{action.label}</p>
                  <p className="text-[12px] text-[#8B95A1] leading-[1.4]">{action.desc}</p>
                </button>
              ))}
            </div>
          </section>

          <div className="section-divider" />

          {/* Trending */}
          <section className="pt-5 pb-2">
            <div className="px-5 mb-[14px] flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-[#191F28] tracking-[-0.4px]">지금 많이 해결하는</h2>
              <span className="text-[13px] text-[#8B95A1]">더보기</span>
            </div>
            <div className="px-5">
              {TRENDING.map((item, i) => (
                <button
                  key={item.q}
                  onClick={() => handleSearch(item.q)}
                  className="flex items-center gap-[14px] py-[14px] w-full text-left border-b border-[#F4F5F7] last:border-b-0 press"
                >
                  <span className={`text-[16px] font-extrabold w-5 text-center tabular-nums ${i < 3 ? "text-[#3182F6]" : "text-[#B0B8C1]"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#191F28] tracking-[-0.3px]">{item.l}</p>
                    <p className="text-[13px] text-[#8B95A1] mt-[2px] tracking-[-0.2px]">{item.d}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-1 rounded-md text-[11px] font-semibold ${
                    item.badgeType === "green"
                      ? "bg-[#E8FAF0] text-[#065F46]"
                      : "bg-[#E8F3FF] text-[#1E40AF]"
                  }`}>
                    {item.badge}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <div className="section-divider mt-2" />

          {/* Popular centers — compact, secondary */}
          <section className="pt-5 pb-4">
            <div className="px-5 mb-[14px] flex items-center justify-between">
              <h2 className="text-[17px] font-extrabold text-[#191F28] tracking-[-0.4px]">고객센터 탐색</h2>
              <span className="text-[13px] text-[#8B95A1] flex items-center gap-1">
                전체보기
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
            <div className="flex gap-[10px] px-5 overflow-x-auto scrollbar-hide pb-2">
              {POPULAR.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/center/${c.id}`)}
                  className="flex-shrink-0 flex flex-col items-center gap-[6px] w-16 press"
                >
                  <CompanyLogo centerId={c.id} size="md" />
                  <span className="text-[11px] font-medium text-[#8B95A1] text-center whitespace-nowrap">{c.name}</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
