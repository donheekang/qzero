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
        if ((data.results || []).length === 0) {
          setActiveTab("ai");
        }
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header */}
      <div className="bg-white px-5 pt-4 pb-4">
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

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all tracking-[-0.3px] ${
              activeTab === "results"
                ? "bg-[#191F28] text-white"
                : "bg-[#F4F5F7] text-[#8B95A1]"
            }`}
          >
            검색 결과{!loading && results.length > 0 ? ` (${results.length})` : ""}
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[12px] transition-all flex items-center justify-center gap-1.5 tracking-[-0.3px] ${
              activeTab === "ai"
                ? "bg-gradient-to-r from-[#00E59B] to-[#00C785] text-white"
                : "bg-[#F4F5F7] text-[#8B95A1]"
            }`}
          >
            <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-extrabold ${
              activeTab === "ai" ? "bg-white/20" : "bg-[#EAEBEE]"
            }`}>Q</span>
            Q헬퍼
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="px-5 pt-4 pb-8">
        {/* Results tab */}
        {activeTab === "results" && (
          <>
            {loading && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-[#EAEBEE] border-t-[#3182F6] rounded-full animate-spin mb-3" />
                <p className="text-[14px] text-[#8B95A1]">검색 중...</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-3 stagger-children">
                {results.slice(0, 3).map((result) => (
                  <div key={result.center.id} className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden">
                    {/* Center header */}
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

                    {/* Solution */}
                    {result.solution && (
                      <div className="px-4 pb-4">
                        <SolutionCard solution={result.solution} center={result.center} />
                      </div>
                    )}

                    {/* Vote */}
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
                  onClick={() => setActiveTab("ai")}
                  className="px-6 py-3 bg-[#191F28] text-white text-[14px] font-semibold rounded-[12px] hover:bg-[#0F1419] transition-colors inline-flex items-center gap-2"
                >
                  <span className="w-5 h-5 bg-gradient-to-br from-[#00E59B] to-[#3182F6] rounded-md flex items-center justify-center text-[8px] font-extrabold">Q</span>
                  Q헬퍼에게 물어보기
                </button>
              </div>
            )}
          </>
        )}

        {/* AI tab */}
        {activeTab === "ai" && (
          <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5">
            <AIAssistant initialQuery={query} compact />
          </div>
        )}
      </div>
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
