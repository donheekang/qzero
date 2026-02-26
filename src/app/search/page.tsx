"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import SolutionCard from "@/components/SolutionCard";
import CrowdVote from "@/components/CrowdVote";
import FreshnessBadge from "@/components/FreshnessBadge";
import CompanyLogo from "@/components/CompanyLogo";
import AIAssistant from "@/components/AIAssistant";

type TabType = "results" | "ai";

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("results");

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setLoading(false);
        // If no results, auto-switch to AI tab
        if ((data.results || []).length === 0) {
          setActiveTab("ai");
        }
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header with search */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.push("/")} className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <SearchBar initialValue={query} size="sm" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("results")}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "results"
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          검색 결과{!loading && results.length > 0 ? ` (${results.length})` : ""}
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${
            activeTab === "ai"
              ? "bg-[#00E59B] text-white"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          AI 물어보기
        </button>
      </div>

      {/* Results tab */}
      {activeTab === "results" && (
        <>
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-[#00E59B] rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">검색 중...</p>
            </div>
          )}

          {/* Results */}
          {!loading && results.length > 0 && (
            <div className="space-y-6">
              {results.slice(0, 3).map((result) => (
                <div key={result.center.id}>
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={() => router.push(`/center/${result.center.id}`)}
                      className="flex items-center gap-2"
                    >
                      <CompanyLogo centerId={result.center.id} size="sm" />
                      <h2 className="text-lg font-bold text-gray-900">{result.center.name}</h2>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        {result.center.category}
                      </span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  <div className="mb-3">
                    <FreshnessBadge freshness={result.center.freshness} />
                  </div>

                  {result.solution && (
                    <SolutionCard solution={result.solution} center={result.center} />
                  )}

                  <div className="mt-4">
                    <CrowdVote centerId={result.center.id} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {!loading && results.length === 0 && query && (
            <div className="text-center py-12">
              <p className="text-gray-600 font-medium mb-1">검색 결과가 없어요</p>
              <p className="text-sm text-gray-400 mb-4">AI 탭에서 직접 물어보세요</p>
              <button
                onClick={() => setActiveTab("ai")}
                className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
              >
                AI에게 물어보기
              </button>
            </div>
          )}
        </>
      )}

      {/* AI tab */}
      {activeTab === "ai" && (
        <AIAssistant initialQuery={query} compact />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#00E59B] rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
