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
        <div className="w-7 h-7 border-2 border-gray-200 border-t-[#3182F6] rounded-full animate-spin mb-3" />
        <p className="text-sm text-gray-400">검색 중...</p>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className="text-center py-12">
        <p className="text-[#4E5968] font-medium mb-1">검색 결과가 없어요</p>
        <p className="text-sm text-[#8B95A1] mb-5">Q헬퍼에게 직접 물어보세요</p>
        {onAIClick && (
          <button
            onClick={onAIClick}
            className="px-5 py-2.5 bg-[#191F28] text-white text-sm font-medium rounded-[12px] hover:bg-opacity-90 transition-colors flex items-center gap-2 mx-auto"
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
          className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden mb-3"
        >
          {/* Center header */}
          <button
            onClick={() => router.push(`/center/${result.center.id}`)}
            className="flex items-center gap-3 p-5 pb-4 w-full text-left"
          >
            <CompanyLogo centerId={result.center.id} size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{result.center.name}</span>
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[12px] text-[#8B95A1]">{result.center.category}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-[#00C785] rounded-full" />
                <span className="text-[12px] text-[#00C785] font-medium">인증됨</span>
              </div>
            </div>
            <svg className="w-4 h-4 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Solution */}
          {result.solution && (
            <SolutionCard solution={result.solution} center={result.center} />
          )}

          {/* Vote buttons row */}
          <div className="border-t border-[#F4F5F7]">
            <div className="flex items-center p-5 pt-4 gap-4">
              <button className="flex-1 text-center text-[14px] text-[#8B95A1] tracking-[-0.2px] py-1 hover:text-[#191F28] transition-colors flex items-center justify-center gap-1.5">
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" /></svg>
                도움됨
              </button>
              <div className="w-px h-4 bg-[#F4F5F7]" />
              <button className="flex-1 text-center text-[14px] text-[#8B95A1] tracking-[-0.2px] py-1 hover:text-[#191F28] transition-colors flex items-center justify-center gap-1.5">
                <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 15V19a3 3 0 003 3l4-9V2H5.72a2 2 0 00-2 1.7l-1.38 9a2 2 0 002 2.3H10zM17 2h2.67A2.31 2.31 0 0122 4v7a2.31 2.31 0 01-2.33 2H17" /></svg>
                도움안됨
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
