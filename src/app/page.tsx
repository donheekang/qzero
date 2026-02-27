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

/* ── Data ── */
const POPULAR = [
  { id: "skt", name: "SKT" },
  { id: "kbbank", name: "국민은행" },
  { id: "samsungcard", name: "삼성카드" },
  { id: "coupang", name: "쿠팡" },
  { id: "nhis", name: "건강보험" },
  { id: "kakao", name: "카카오" },
  { id: "naver", name: "네이버" },
  { id: "kt", name: "KT" },
];

const QUICK = [
  { q: "SKT 해지", l: "SKT 해지" },
  { q: "쿠팡 반품", l: "쿠팡 반품" },
  { q: "카드 한도 조회", l: "카드 한도" },
  { q: "요금제 변경", l: "요금 변경" },
  { q: "대출 상담", l: "대출 상담" },
  { q: "넷플릭스 해지", l: "넷플릭스 해지" },
];

const TRENDING = [
  { q: "SKT 요금제 변경", l: "SKT 요금제 변경", d: "T월드 앱에서 바로 가능" },
  { q: "삼성카드 한도", l: "삼성카드 한도 상향", d: "ARS 1번 → 3번 빠른 연결" },
  { q: "쿠팡 환불", l: "쿠팡 환불/반품", d: "앱에서 3분 완료" },
];

/* ── 카테고리 탭 ── */
const TABS = ["전체", "통신", "금융", "공공", "쇼핑", "생활"] as const;
type Tab = (typeof TABS)[number];

const TAB_MAP: Record<Exclude<Tab, "전체">, string[]> = {
  통신: ["통신사"],
  금융: ["은행", "카드", "보험"],
  공공: ["공공기관"],
  쇼핑: ["쇼핑", "배달"],
  생활: ["IT · 플랫폼", "항공 · 여행", "택배 · 물류", "전자 · 자동차"],
};

const SECTIONS = [
  {
    title: "통신사",
    items: [
      { id: "skt", name: "SKT" },
      { id: "kt", name: "KT" },
      { id: "lguplus", name: "LG U+" },
    ],
  },
  {
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
    title: "보험",
    items: [
      { id: "samsunglife", name: "삼성생명" },
      { id: "hyundaiins", name: "현대해상" },
      { id: "dbins", name: "DB손보" },
    ],
  },
  {
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
    title: "배달",
    items: [
      { id: "baemin", name: "배민" },
      { id: "yogiyo", name: "요기요" },
    ],
  },
  {
    title: "IT · 플랫폼",
    items: [
      { id: "naver", name: "네이버" },
      { id: "kakao", name: "카카오" },
      { id: "netflix", name: "넷플릭스" },
      { id: "disneyplus", name: "디즈니+" },
    ],
  },
  {
    title: "항공 · 여행",
    items: [
      { id: "koreanair", name: "대한항공" },
      { id: "asiana", name: "아시아나" },
      { id: "yanolja", name: "야놀자" },
    ],
  },
  {
    title: "택배 · 물류",
    items: [
      { id: "cjlogistics", name: "CJ대한통운" },
      { id: "hanjin", name: "한진택배" },
    ],
  },
  {
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

/* ══════════════════════════════════════
   Home Component
   ══════════════════════════════════════ */
export default function Home() {
  const router = useRouter();
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAI, setShowAI] = useState(false);
  const [tab, setTab] = useState<Tab>("전체");
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

  const visibleSections =
    tab === "전체"
      ? SECTIONS
      : SECTIONS.filter((s) => TAB_MAP[tab]?.includes(s.title));

  /* ── Render ── */
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

      {/* ━━━ Search ━━━ */}
      <div className="px-5 pt-1 pb-3">
        <SearchBar autoFocus size={searched ? "sm" : "lg"} onSearch={handleSearch} />
      </div>

      {/* ━━━ Search Results Mode ━━━ */}
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

      {/* ━━━ Home Content ━━━ */}
      {!searched && (
        <>
          {/* Quick chips */}
          <div className="flex gap-2 px-5 pb-5 overflow-x-auto scrollbar-hide">
            {QUICK.map((item) => (
              <button
                key={item.q}
                onClick={() => handleSearch(item.q)}
                className="flex-shrink-0 px-3.5 py-[7px] rounded-full text-[13px] font-medium text-[#4E5968] bg-[#F4F5F7] hover:bg-[#EAEBEE] transition-colors press"
              >
                {item.l}
              </button>
            ))}
          </div>

          {/* ── 자주 찾는 고객센터 ── */}
          <section className="px-5 pb-5">
            <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.4px] mb-4">자주 찾는 고객센터</h2>
            <div className="grid grid-cols-4 gap-y-2 stagger-children">
              {POPULAR.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/center/${c.id}`)}
                  className="flex flex-col items-center gap-2 py-2 rounded-xl hover:bg-[#F8F9FA] transition-colors press"
                >
                  <CompanyLogo centerId={c.id} size="lg" />
                  <span className="text-[12px] font-medium text-[#4E5968] tracking-[-0.2px]">{c.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* ── AI 배너 ── */}
          <section className="px-5 pb-2">
            <button
              onClick={() => handleSearch("AI 상담")}
              className="w-full bg-[#191F28] rounded-2xl p-5 flex items-center gap-4 press relative overflow-hidden"
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#00E59B] opacity-[0.12] rounded-full blur-[40px]" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-[#3182F6] opacity-[0.08] rounded-full blur-[40px]" />
              <div className="relative z-10 w-11 h-11 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-[14px] flex items-center justify-center shrink-0">
                <span className="text-white text-[12px] font-extrabold">Q</span>
              </div>
              <div className="relative z-10 flex-1 text-left">
                <p className="text-[11px] font-bold text-[#00E59B] tracking-[0.3px] mb-1">AI HELPER</p>
                <p className="text-[15px] font-bold text-white tracking-[-0.3px] leading-snug">고객센터 문제,<br/>Q헬퍼가 해결해드려요</p>
              </div>
              <svg className="w-5 h-5 text-white/20 shrink-0 relative z-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </section>

          {/* ── 구분선 ── */}
          <div className="section-divider mt-5" />

          {/* ── 전체 고객센터 ── */}
          <section className="pt-5 pb-2">
            <div className="px-5 mb-4 flex items-center justify-between">
              <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.4px]">전체 고객센터</h2>
              <span className="text-[13px] text-[#8B95A1]">
                {SECTIONS.reduce((a, s) => a + s.items.length, 0)}개
              </span>
            </div>

            {/* Category tabs */}
            <div className="flex gap-[6px] px-5 mb-5 overflow-x-auto scrollbar-hide">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-shrink-0 px-4 py-[7px] rounded-full text-[13px] font-semibold tracking-[-0.3px] transition-all duration-200 press ${
                    tab === t
                      ? "bg-[#191F28] text-white"
                      : "bg-[#F4F5F7] text-[#8B95A1] hover:text-[#4E5968] hover:bg-[#EAEBEE]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Section list */}
            <div>
              {visibleSections.map((section, i) => (
                <div key={section.title}>
                  {/* Thin divider between sections */}
                  {i > 0 && <div className="h-px bg-[#F2F3F5] mx-5" />}

                  <div className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[15px] font-bold text-[#191F28] tracking-[-0.3px]">{section.title}</h3>
                      <span className="text-[12px] text-[#B0B8C1]">{section.items.length}개</span>
                    </div>

                    <div className="grid grid-cols-4 gap-y-1">
                      {section.items.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => router.push(`/center/${c.id}`)}
                          className="flex flex-col items-center gap-[6px] py-2.5 rounded-xl hover:bg-[#F8F9FA] transition-colors press"
                        >
                          <CompanyLogo centerId={c.id} size="md" />
                          <span className="text-[11px] font-medium text-[#6B7684] tracking-[-0.2px] text-center leading-tight">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── 구분선 ── */}
          <div className="section-divider" />

          {/* ── 지금 많이 찾는 ── */}
          <section className="px-5 pt-5 pb-4">
            <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.4px] mb-1">지금 많이 찾는</h2>
            <div>
              {TRENDING.map((item, i) => (
                <button
                  key={item.q}
                  onClick={() => handleSearch(item.q)}
                  className="flex items-center gap-4 py-[14px] w-full text-left border-b border-[#F4F5F7] last:border-b-0 press"
                >
                  <span className="text-[16px] font-extrabold text-[#3182F6] w-5 text-center tabular-nums">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold text-[#191F28] tracking-[-0.3px]">{item.l}</p>
                    <p className="text-[13px] text-[#8B95A1] mt-[2px] tracking-[-0.2px]">{item.d}</p>
                  </div>
                  <svg className="w-4 h-4 text-[#D1D6DB] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
