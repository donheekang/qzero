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

const CATEGORIES = [
  {
    title: "통신사",
    icon: "📡",
    color: "#E4002B",
    items: [
      { id: "skt", name: "SKT" },
      { id: "kt", name: "KT" },
      { id: "lguplus", name: "LG U+" },
    ],
  },
  {
    title: "은행",
    icon: "🏦",
    color: "#FFBC00",
    items: [
      { id: "kbbank", name: "국민은행" },
      { id: "shinhanbank", name: "신한은행" },
      { id: "hanabank", name: "하나은행" },
      { id: "wooribank", name: "우리은행" },
      { id: "nonghyup", name: "농협" },
      { id: "kakaobank", name: "카카오뱅크" },
      { id: "kbank", name: "케이뱅크" },
      { id: "toss", name: "토스" },
    ],
  },
  {
    title: "카드",
    icon: "💳",
    color: "#1428A0",
    items: [
      { id: "samsungcard", name: "삼성카드" },
      { id: "hyundaicard", name: "현대카드" },
      { id: "kbcard", name: "KB카드" },
      { id: "shinhancard", name: "신한카드" },
      { id: "lottecard", name: "롯데카드" },
    ],
  },
  {
    title: "보험",
    icon: "🛡️",
    color: "#0B4DA2",
    items: [
      { id: "samsunglife", name: "삼성생명" },
      { id: "hyundaiins", name: "현대해상" },
      { id: "dbins", name: "DB손보" },
    ],
  },
  {
    title: "공공기관",
    icon: "🏛️",
    color: "#003DA5",
    items: [
      { id: "nhis", name: "건강보험" },
      { id: "nps", name: "국민연금" },
      { id: "gov24", name: "정부24" },
      { id: "nts", name: "국세청" },
      { id: "ei", name: "고용센터" },
    ],
  },
  {
    title: "쇼핑",
    icon: "🛒",
    color: "#E31837",
    items: [
      { id: "coupang", name: "쿠팡" },
      { id: "11st", name: "11번가" },
      { id: "musinsa", name: "무신사" },
      { id: "gmarket", name: "G마켓" },
      { id: "ssg", name: "SSG" },
      { id: "daangn", name: "당근" },
      { id: "oliveyoung", name: "올리브영" },
      { id: "ohouse", name: "오늘의집" },
    ],
  },
  {
    title: "배달",
    icon: "🍔",
    color: "#2AC1BC",
    items: [
      { id: "baemin", name: "배민" },
      { id: "yogiyo", name: "요기요" },
    ],
  },
  {
    title: "IT · 플랫폼",
    icon: "💻",
    color: "#03C75A",
    items: [
      { id: "naver", name: "네이버" },
      { id: "kakao", name: "카카오" },
      { id: "netflix", name: "넷플릭스" },
      { id: "disneyplus", name: "디즈니+" },
    ],
  },
  {
    title: "항공 · 여행",
    icon: "✈️",
    color: "#00256C",
    items: [
      { id: "koreanair", name: "대한항공" },
      { id: "asiana", name: "아시아나" },
      { id: "yanolja", name: "야놀자" },
    ],
  },
  {
    title: "택배 · 물류",
    icon: "📦",
    color: "#E4002B",
    items: [
      { id: "cjlogistics", name: "CJ대한통운" },
      { id: "hanjin", name: "한진택배" },
    ],
  },
  {
    title: "전자 · 자동차",
    icon: "📱",
    color: "#1428A0",
    items: [
      { id: "samsung", name: "삼성전자" },
      { id: "lg", name: "LG전자" },
      { id: "apple", name: "Apple" },
      { id: "hyundaicar", name: "현대자동차" },
      { id: "kia", name: "기아" },
    ],
  },
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
          {/* AI Banner - compact */}
          <div className="px-5 mb-6">
            <button
              onClick={() => { handleSearch("AI 상담 도움"); }}
              className="w-full relative bg-[#191F28] rounded-[16px] p-4 overflow-hidden flex items-center gap-4 card-press"
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#00E59B] opacity-[0.12] rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-4 w-24 h-24 bg-[#3182F6] opacity-[0.08] rounded-full blur-3xl" />
              <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-[12px] flex items-center justify-center shrink-0">
                <span className="text-white text-[11px] font-extrabold">Q</span>
              </div>
              <div className="relative z-10 flex-1 text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E59B] animate-pulse-dot" />
                  <span className="text-[11px] font-semibold text-white/50 tracking-[-0.2px]">AI POWERED</span>
                </div>
                <h3 className="text-[15px] font-bold text-white tracking-[-0.3px]">Q헬퍼에게 무엇이든 물어보세요</h3>
              </div>
              <svg className="w-5 h-5 text-white/30 shrink-0 relative z-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Category Sections */}
          <div className="pb-6">
            {CATEGORIES.map((cat, catIdx) => (
              <div key={cat.title} className="mb-5" style={{ animationDelay: `${catIdx * 40}ms` }}>
                {/* Category Header */}
                <div className="flex items-center gap-2 px-5 mb-2.5">
                  <span className="text-[15px]">{cat.icon}</span>
                  <h3 className="text-[16px] font-bold text-[#191F28] tracking-[-0.4px]">{cat.title}</h3>
                  <span className="text-[12px] font-medium text-[#B0B8C1] ml-0.5">{cat.items.length}</span>
                </div>

                {/* Scrollable Row */}
                <div className="flex gap-2 px-5 overflow-x-auto scrollbar-hide pb-1">
                  {cat.items.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/center/${c.id}`)}
                      className="flex flex-col items-center gap-1.5 min-w-[64px] py-2.5 px-1 rounded-2xl hover:bg-[#F4F5F7] transition-colors duration-200 card-press shrink-0"
                    >
                      <CompanyLogo centerId={c.id} size="md" />
                      <span className="text-[11px] font-medium text-[#4E5968] tracking-[-0.2px] text-center whitespace-nowrap">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Trending */}
          <div className="px-5 mb-4 pt-1 border-t border-[#F2F3F5]">
            <h3 className="text-[16px] font-bold text-[#191F28] tracking-[-0.4px] mt-5 mb-3">🔥 지금 많이 찾는</h3>
            <div className="flex flex-col gap-0.5">
              {TRENDING.map((item, i) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl hover:bg-[#F4F5F7] transition-colors duration-200 w-full text-left"
                >
                  <span className="text-[15px] font-extrabold text-[#3182F6] w-5 text-center">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-semibold text-[#191F28] tracking-[-0.3px]">{item.label}</div>
                    <div className="text-[12px] text-[#8B95A1] mt-0.5 tracking-[-0.2px]">{item.desc}</div>
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
