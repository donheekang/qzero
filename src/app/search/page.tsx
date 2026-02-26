"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import SearchBar from "@/components/SearchBar";
import SolutionCard from "@/components/SolutionCard";
import CrowdVote from "@/components/CrowdVote";
import FreshnessBadge from "@/components/FreshnessBadge";
import PremiumLock from "@/components/PremiumLock";
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPremiumNeeded, setIsPremiumNeeded] = useState(false);
  const [suggestPremium, setSuggestPremium] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results || []);
        setIsPremiumNeeded(data.isPremiumNeeded || false);
        setSuggestPremium(data.suggestPremium || false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query]);

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header with search */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <SearchBar initialValue={query} size="sm" />
        </div>
      </div>

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
              {/* Center header */}
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

              {/* Freshness badge */}
              <div className="mb-3">
                <FreshnessBadge freshness={result.center.freshness} />
              </div>

              {/* Solution card */}
              {result.solution && (
                <SolutionCard solution={result.solution} center={result.center} />
              )}

              {/* Timer link */}
              {result.solution?.arsPath && result.center.tel && (
                <button
                  onClick={() =>
                    router.push(
                      `/timer?center=${result.center.id}&ars=${encodeURIComponent(result.solution?.arsPath || "")}&purpose=${encodeURIComponent(result.purpose || "")}`
                    )
                  }
                  className="w-full mt-3 py-2.5 text-sm text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  대기 타이머 시작하기
                </button>
              )}

              {/* Crowd vote */}
              <div className="mt-4">
                <CrowdVote centerId={result.center.id} />
              </div>
            </div>
          ))}

          {/* Premium upsell */}
          {(isPremiumNeeded || suggestPremium) && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                AI 프리미엄 기능
              </h3>
              <PremiumLock
                feature="custom_script"
                title="맞춤 상담 멘트"
                description="상담원에게 정확히 뭐라고 말해야 할지 AI가 알려줘요"
                icon="PRO"
                previewContent="상담원 연결 시 이렇게 말하세요: '안녕하세요, 현재 요금제 관련 문의가 있어서 전화드렸습니다...'"
              />
              <PremiumLock
                feature="cancellation_coaching"
                title="해지 방어 코칭"
                description="유지팀의 예상 제안과 최적 협상 전략을 미리 알려줘요"
                icon="PRO"
              />
              <PremiumLock
                feature="complaint_draft"
                title="민원 대필"
                description="소비자보호법 근거가 포함된 공식 민원 글을 자동 생성해요"
                icon="PRO"
              />
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {!loading && results.length === 0 && query && (
        <div className="text-center py-16">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <p className="text-gray-700 font-medium mb-2">일치하는 결과가 없어요</p>
          <p className="text-sm text-gray-500 mb-6">다른 키워드로 검색해보시거나,<br/>AI가 분석해드릴까요?</p>
          <button className="px-6 py-2.5 bg-gradient-to-r from-[#00E59B] to-[#00C785] text-white text-sm font-medium rounded-xl">
            AI에게 물어보기 (프리미엄)
          </button>
        </div>
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
