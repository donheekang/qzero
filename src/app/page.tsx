"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import InlineResults from "@/components/InlineResults";
import AIAssistant from "@/components/AIAssistant";
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

const POPULAR_CENTERS = [
  { id: "skt", name: "SKT" },
  { id: "kbbank", name: "국민은행" },
  { id: "samsungcard", name: "삼성카드" },
  { id: "coupang", name: "쿠팡" },
  { id: "nhis", name: "건강보험" },
  { id: "kakao", name: "카카오" },
  { id: "naver", name: "네이버" },
  { id: "kt", name: "KT" },
];

const QUICK_ACTIONS = [
  { query: "SKT 해지", label: "SKT 해지" },
  { query: "쿠팡 반품", label: "쿠팡 반품" },
  { query: "카드 한도", label: "카드 한도" },
  { query: "요금제 변경", label: "요금 변경" },
  { query: "대출 상담", label: "대출 상담" },
];

const TRENDING = [
  { query: "SKT 요금제 변경", label: "SKT 요금제 변경", desc: "T월드 앱으로 바로 해결 가능" },
  { query: "삼성카드 한도", label: "삼성카드 한도 상향", desc: "ARS 1번 → 3번으로 빠르게" },
  { query: "쿠팡 환불", label: "쿠팡 환불/반품", desc: "앱에서 3분이면 완료" },
];

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-6 pt-4 pb-0">
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-[2px]">
            <span className="text-2xl font-extrabold tracking-[-1px] text-brand-gradient">Q</span>
            <span className="text-2xl font-extrabold tracking-[-1px] text-[#191F28]">zero</span>
          </div>
          {searched ? (
            <button
              onClick={() => { setSearched(false); setResults([]); setSearchQuery(""); }}
              className="w-9 h-9 rounded-full bg-[#F4F5F7] flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <div className="w-9 h-9 rounded-full bg-[#F4F5F7] flex items-center justify-center">
              <svg className="w-[18px] h-[18px] text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Hero text */}
      {!searched && (
        <div className="px-6 mb-6 animate-fade-in">
          <h2 className="text-[26px] font-bold leading-[1.35] tracking-[-0.6px] text-[#191F28]">
            고객센터 문제,<br />
            <span className="text-[#00C785]">검색 한 번</span>이면 끝
          </h2>
        </div>
      )}

      {/* Search */}
      <div className={`px-5 ${searched ? "mb-4" : "mb-5"}`}>
        <SearchBar autoFocus size={searched ? "sm" : "lg"} onSearch={handleSearch} />
      </div>

      {/* Quick chips */}
      {!searched && (
        <div className="flex gap-2 px-5 mb-7 overflow-x-auto scrollbar-hide">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.query}
              onClick={() => handleSearch(item.query)}
              className="flex-shrink-0 px-4 py-2.5 bg-white border border-[#EAEBEE] rounded-full text-sm font-medium text-[#4E5968] tracking-[-0.3px] hover:border-[#00C785] hover:text-[#00C785] hover:bg-[#E5FFF3] transition-all duration-200"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Results */}
      {searched && (
        <div ref={resultsRef} className="bg-[#F4F5F7] min-h-[60vh] px-5 pt-4 pb-8">
          <InlineResults
            results={results}
            loading={loading}
            query={searchQuery}
            onAIClick={handleAIClick}
          />

          {(showAI || (!loading && results.length > 0)) && (
            <div className="mt-4 bg-white rounded-[20px] shadow-toss p-5 animate-slide-up">
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

      {/* Before search content */}
      {!searched && (
        <>
          {/* AI Banner */}
          <div className="px-5 mb-7">
            <div className="relative bg-[#191F28] rounded-[20px] p-6 overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#00E59B] opacity-[0.12] rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-5 w-32 h-32 bg-[#3182F6] opacity-[0.08] rounded-full blur-3xl" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.08] rounded-full mb-3.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E59B] animate-pulse-dot" />
                  <span className="text-[12px] font-semibold text-white/60 tracking-[-0.2px]">AI POWERED</span>
                </div>
                <h3 className="text-[18px] font-bold text-white leading-[1.4] tracking-[-0.4px] mb-2">
                  Q헬퍼가 대신<br />고객센터 문제를 분석해요
                </h3>
                <p className="text-[14px] text-white/50 tracking-[-0.2px] mb-4">
                  맞춤 상담 멘트부터 해지 코칭까지
                </p>
                <div className="flex gap-2">
                  {["상담 가이드", "문제 분석", "멘트 생성"].map((tag) => (
                    <span key={tag} className="px-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-full text-[12px] text-white/60 tracking-[-0.2px]">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Centers Grid */}
          <div className="px-5 mb-7">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-[18px] font-bold text-[#191F28] tracking-[-0.4px]">자주 찾는 고객센터</h3>
              <span className="text-[14px] text-[#8B95A1] cursor-pointer">전체보기</span>
            </div>
            <div className="grid grid-cols-4 gap-3 stagger-children">
              {POPULAR_CENTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/center/${c.id}`)}
                  className="flex flex-col items-center gap-2 py-4 px-2 rounded-2xl hover:bg-[#F4F5F7] transition-colors duration-200 card-press"
                >
                  <CompanyLogo centerId={c.id} size="md" />
                  <span className="text-[12px] font-medium text-[#4E5968] tracking-[-0.2px] text-center">{c.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Trending */}
          <div className="px-5 mb-4">
            <h3 className="text-[18px] font-bold text-[#191F28] tracking-[-0.4px] mb-3.5">지금 많이 찾는</h3>
            <div className="flex flex-col gap-0.5">
              {TRENDING.map((item, i) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl hover:bg-[#F4F5F7] transition-colors duration-200 w-full text-left"
                >
                  <span className="text-[16px] font-extrabold text-[#3182F6] w-6 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-semibold text-[#191F28] tracking-[-0.3px]">{item.label}</div>
                    <div className="text-[13px] text-[#8B95A1] mt-0.5 tracking-[-0.2px]">{item.desc}</div>
                  </div>
                  <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
