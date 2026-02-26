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
      // Scroll to results
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
    <div className="px-5 pt-12 pb-8">
      {/* Logo & Title */}
      <div className={`text-center transition-all duration-300 ${searched ? "mb-6" : "mb-10"}`}>
        <h1 className={`font-bold text-gray-900 transition-all duration-300 ${searched ? "text-2xl mb-0.5" : "text-3xl mb-1"}`}>
          <span className="text-[#00E59B]">Q</span>zero
        </h1>
        {!searched && (
          <p className="text-gray-500 text-sm">고객센터, 더 이상 기다리지 마세요</p>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar autoFocus size={searched ? "sm" : "lg"} onSearch={handleSearch} />
      </div>

      {/* Search Results (inline) */}
      {searched && (
        <div ref={resultsRef}>
          <InlineResults
            results={results}
            loading={loading}
            query={searchQuery}
            onAIClick={handleAIClick}
          />

          {/* AI Section - show after results or on demand */}
          {(showAI || (!loading && results.length > 0)) && (
            <div className="mt-6">
              <div className="border-t border-gray-100 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-5 h-5 bg-[#00E59B] rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold text-gray-900">AI에게 더 물어보기</span>
                </div>
                <AIAssistant
                  initialQuery={searchQuery}
                  compact
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Popular Centers - only show before search */}
      {!searched && (
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-3">자주 찾는 고객센터</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_CENTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => router.push(`/center/${c.id}`)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-full hover:bg-gray-100 transition-colors"
              >
                <CompanyLogo centerId={c.id} size="xs" />
                <span className="text-xs text-gray-600">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      {!searched && (
        <div className="text-center mt-16">
          <p className="text-xs text-gray-400">
            Qzero는 공개된 고객센터 정보를 정리하여 제공합니다.
          </p>
        </div>
      )}
    </div>
  );
}
