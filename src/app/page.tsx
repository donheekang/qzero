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

/* ── 카테고리 탭 정의 ── */
const TABS = [
  { key: "all", label: "전체" },
  { key: "telecom", label: "통신" },
  { key: "finance", label: "금융" },
  { key: "public", label: "공공" },
  { key: "shopping", label: "쇼핑" },
  { key: "life", label: "생활" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ── 섹션 데이터 (탭별 그룹) ── */
const SECTIONS: { tab: TabKey; title: string; items: { id: string; name: string }[] }[] = [
  {
    tab: "telecom",
    title: "통신사",
    items: [
      { id: "skt", name: "SKT" },
      { id: "kt", name: "KT" },
      { id: "lguplus", name: "LG U+" },
    ],
  },
  {
    tab: "finance",
    title: "은행",
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
    tab: "finance",
    title: "카드",
    items: [
      { id: "samsungcard", name: "삼성카드" },
      { id: "hyundaicard", name: "현대카드" },
      { id: "kbcard", name: "KB카드" },
      { id: "shinhancard", name: "신한카드" },
      { id: "lottecard", name: "롯데카드" },
    ],
  },
  {
    tab: "finance",
    title: "보험",
    items: [
      { id: "samsunglife", name: "삼성생명" },
      { id: "hyundaiins", name: "현대해상" },
      { id: "dbins", name: "DB손보" },
    ],
  },
  {
    tab: "public",
    title: "공공기관",
    items: [
      { id: "nhis", name: "건강보험" },
      { id: "nps", name: "국민연금" },
      { id: "gov24", name: "정부24" },
      { id: "nts", name: "국세청" },
      { id: "ei", name: "고용센터" },
    ],
  },
  {
    tab: "shopping",
    title: "쇼핑",
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
    tab: "shopping",
    title: "배달",
    items: [
      { id: "baemin", name: "배민" },
      { id: "yogiyo", name: "요기요" },
    ],
  },
  {
    tab: "life",
    title: "IT · 플랫폼",
    items: [
      { id: "naver", name: "네이버" },
      { id: "kakao", name: "카카오" },
      { id: "netflix", name: "넷플릭스" },
      { id: "disneyplus", name: "디즈니+" },
    ],
  },
  {
    tab: "life",
    title: "항공 · 여행",
    items: [
      { id: "koreanair", name: "대한항공" },
      { id: "asiana", name: "아시아나" },
      { id: "yanolja", name: "야놀자" },
    ],
  },
  {
    tab: "life",
    title: "택배 · 물류",
    items: [
      { id: "cjlogistics", name: "CJ대한통운" },
      { id: "hanjin", name: "한진택배" },
    ],
  },
  {
    tab: "life",
    title: "전자 · 자동차",
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
  const [activeTab, setActiveTab] = useState<TabKey>("all");
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

  const filteredSections =
    activeTab === "all" ? SECTIONS : SECTIONS.filter((s) => s.tab === activeTab);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2px]">
              <span className="text-[22px] font-extrabold tracking-[-1px] text-brand-gradient">Q</span>
              <span className="text-[22px] font-extrabold tracking-[-1px] text-[#191F28]">zero</span>
            </div>
            {searched ? (
              <button
                onClick={() => { setSearched(false); setResults([]); setSearchQuery(""); }}
                className="w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center"
              >
                <svg className="w-4 h-4 text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#F4F5F7] flex items-center justify-center">
                <svg className="w-[16px] h-[16px] text-[#8B95A1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* ── Search ── */}
        <div className="px-5 pb-3">
          <SearchBar autoFocus size={searched ? "sm" : "lg"} onSearch={handleSearch} />
        </div>

        {/* ── Category Tabs (only when not searched) ── */}
        {!searched && (
          <div className="flex gap-1 px-5 pb-3 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 px-4 py-[7px] rounded-full text-[13px] font-semibold tracking-[-0.3px] transition-all duration-200 ${
                  activeTab === tab.key
                    ? "bg-[#191F28] text-white"
                    : "bg-[#F4F5F7] text-[#8B95A1] hover:text-[#4E5968]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* bottom border */}
        <div className="h-px bg-[#F2F3F5]" />
      </div>

      {/* ── Search Results ── */}
      {searched && (
        <div ref={resultsRef} className="px-5 pt-4 pb-8">
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

      {/* ── Main Content (before search) ── */}
      {!searched && (
        <div className="pt-3 pb-28">
          {/* Quick chips */}
          <div className="flex gap-2 px-5 mb-4 overflow-x-auto scrollbar-hide">
            {QUICK_ACTIONS.map((item) => (
              <button
                key={item.query}
                onClick={() => handleSearch(item.query)}
                className="flex-shrink-0 px-3.5 py-2 bg-white rounded-full text-[13px] font-medium text-[#4E5968] tracking-[-0.3px] shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_1px_6px_rgba(0,0,0,0.1)] hover:text-[#191F28] transition-all duration-200"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* AI Banner */}
          <div className="px-4 mb-4">
            <button
              onClick={() => { handleSearch("AI 상담 도움"); }}
              className="w-full relative bg-[#191F28] rounded-2xl p-4 overflow-hidden flex items-center gap-3.5 card-press"
            >
              <div className="absolute -top-8 -right-8 w-28 h-28 bg-[#00E59B] opacity-[0.15] rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-4 w-20 h-20 bg-[#3182F6] opacity-[0.1] rounded-full blur-3xl" />
              <div className="relative z-10 w-9 h-9 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white text-[10px] font-extrabold">Q</span>
              </div>
              <div className="relative z-10 flex-1 text-left min-w-0">
                <p className="text-[10px] font-semibold text-[#00E59B] tracking-[0.5px] mb-0.5">AI POWERED</p>
                <p className="text-[14px] font-bold text-white tracking-[-0.3px] leading-tight">Q헬퍼에게 무엇이든 물어보세요</p>
              </div>
              <svg className="w-4 h-4 text-white/30 shrink-0 relative z-10" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* ── Category Card Sections ── */}
          <div className="px-4 flex flex-col gap-3">
            {filteredSections.map((section) => (
              <div
                key={section.title}
                className="bg-white rounded-2xl px-4 pt-4 pb-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              >
                {/* Section title */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.4px]">{section.title}</h3>
                  <span className="text-[12px] text-[#B0B8C1] font-medium">{section.items.length}개</span>
                </div>

                {/* 4-column grid */}
                <div className="grid grid-cols-4 gap-y-1">
                  {section.items.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => router.push(`/center/${c.id}`)}
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors duration-150 card-press"
                    >
                      <CompanyLogo centerId={c.id} size="md" />
                      <span className="text-[11px] font-medium text-[#6B7684] tracking-[-0.2px] text-center leading-tight">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Trending ── */}
          <div className="px-4 mt-3">
            <div className="bg-white rounded-2xl px-4 pt-4 pb-2 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.4px] mb-2">지금 많이 찾는</h3>
              {TRENDING.map((item, i) => (
                <button
                  key={item.query}
                  onClick={() => handleSearch(item.query)}
                  className="flex items-center gap-3 py-3 w-full text-left border-t border-[#F4F5F7] first:border-t-0 hover:bg-[#F8F9FA] -mx-4 px-4 transition-colors duration-150"
                >
                  <span className="text-[14px] font-extrabold text-[#3182F6] w-5 text-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#191F28] tracking-[-0.3px]">{item.label}</p>
                    <p className="text-[12px] text-[#8B95A1] mt-0.5 tracking-[-0.2px]">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#D1D6DB] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
