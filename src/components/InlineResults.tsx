"use client";

import { useRouter } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";
import SolutionCard from "@/components/SolutionCard";

interface InlineResult {
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

interface InlineResultsProps {
  results: InlineResult[];
  loading: boolean;
  query: string;
  onAIClick?: () => void;
}

export default function InlineResults({ results, loading, query, onAIClick }: InlineResultsProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12">
        <div className="w-7 h-7 border-2 border-gray-200 border-t-[#00E59B] rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">검색 중...</p>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 font-medium mb-1">검색 결과가 없어요</p>
        <p className="text-sm text-gray-400 mb-5">Q헬퍼에게 직접 물어보세요</p>
        {onAIClick && (
          <button
            onClick={onAIClick}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2 mx-auto"
          >
            <span className="w-5 h-5 bg-[#00E59B] rounded-md flex items-center justify-center text-[8px] font-bold">Q</span>
            Q헬퍼에게 물어보기
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {results.slice(0, 3).map((result) => (
        <div
          key={result.center.id}
          className="bg-gray-50 rounded-2xl p-4"
        >
          {/* Center header - clickable */}
          <button
            onClick={() => router.push(`/center/${result.center.id}`)}
            className="flex items-center gap-2.5 mb-3 w-full text-left"
          >
            <CompanyLogo centerId={result.center.id} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{result.center.name}</span>
                <span className="text-xs text-gray-400">{result.center.category}</span>
              </div>
              {result.center.tel && (
                <p className="text-xs text-gray-500 mt-0.5">{result.center.tel}</p>
              )}
            </div>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Solution */}
          {result.solution && (
            <SolutionCard solution={result.solution} center={result.center} />
          )}

          {/* Quick actions */}
          <div className="flex gap-2 mt-3">
            {result.center.tel && (
              <a
                href={`tel:${result.center.tel.replace(/-/g, "")}`}
                className="flex-1 py-2 text-center text-xs font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:border-[#00E59B] transition-colors"
              >
                전화걸기
              </a>
            )}
            <button
              onClick={() => router.push(`/center/${result.center.id}`)}
              className="flex-1 py-2 text-center text-xs font-medium text-gray-600 bg-white rounded-xl border border-gray-200 hover:border-[#00E59B] transition-colors"
            >
              상세보기
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
