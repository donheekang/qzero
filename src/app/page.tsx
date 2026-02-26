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
];

const QUICK_ACTIONS = [
  { query: "SKT 해지", label: "SKT 해지" },
  { query: "쿠팡 반품", label: "쿠팡 반품" },
  { query: "카드 한도", label: "카드 한도" },
  { query: "대출 상담", label: "대출 상담" },
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
    <div className="px-5 pt-10 pb-8">
      {/* Logo */}
      <div className={`text-center transition-all duration-300 ${searched ? "mb-5" : "mb-8"}`}>
        <h1 className={`font-bold text-gray-900 transition-all duration-300 ${searched ? "text-xl" : "text-3xl mb-2"}`}>
          <span className="text-[#00E59B]">Q</span>zero
        </h1>
        {!searched && (
          <p className="text-gray-400 text-sm">고객센터 문제, 검색 한 번이면 끝</p>
        )}
      </div>

      {/* Search */}
      <div className={`transition-all duration-300 ${searched ? "mb-4" : "mb-6"}`}>
        <SearchBar autoFocus size={searched ? "sm" : "lg"} onSearch={handleSearch} />
      </div>

      {/* Quick action chips - before search */}
      {!searched && (
        <div className="flex flex-wrap gap-2 mb-8">
          {QUICK_ACTIONS.map((item) => (
            <button
              key={item.query}
              onClick={() => handleSearch(item.query)}
              className="px-3.5 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-500 hover:border-[#00E59B] hover:text-[#00E59B] transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Results (inline) */}
      {searched && (
        <div ref={resultsRef}>
          <InlineResults
            results={results}
            loading={loading}
            query={searchQuery}
            onAIClick={handleAIClick}
          />

          {/* Q헬퍼 section */}
          {(showAI || (!loading && results.length > 0)) && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 bg-gradient-to-br from-[#00E59B] to-[#00C785] rounded-lg flex items-center justify-center">
                  <span className="text-white text-[9px] font-bold">Q</span>
                </div>
                <span className="text-sm font-bold text-gray-900">Q헬퍼에게 물어보기</span>
              </div>
              <AIAssistant initialQuery={searchQuery} compact />
            </div>
          )}
        </div>
      )}

      {/* Popular Centers - before search */}
      {!searched && (
        <>
          {/* Q헬퍼 소개 카드 */}
          <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-[#00E59B] rounded-xl flex items-center justify-center">
                <span className="text-white text-sm font-bold">Q</span>
              </div>
              <div>
                <h3 className="font-bold text-sm">Q헬퍼</h3>
                <p className="text-[10px] text-gray-400">AI 고객센터 도우미</p>
              </div>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              상담 가이드, 문제 분석, 상담 멘트까지.
              Q헬퍼가 고객센터 전화를 쉽게 만들어드려요.
            </p>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] text-gray-300">상담 가이드</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] text-gray-300">문제 분석</span>
              <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] text-gray-300">상담 멘트</span>
            </div>
          </div>

          {/* Popular centers */}
          <div>
            <p className="text-xs text-gray-400 mb-3">자주 찾는 고객센터</p>
            <div className="grid grid-cols-3 gap-2">
              {POPULAR_CENTERS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => router.push(`/center/${c.id}`)}
                  className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors"
                >
                  <CompanyLogo centerId={c.id} size="sm" />
                  <span className="text-xs text-gray-600">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      {!searched && (
        <div className="text-center mt-12">
          <p className="text-[10px] text-gray-300">
            Qzero - 모든 고객센터를 쉽게
          </p>
        </div>
      )}
    </div>
  );
}
