"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import FreshnessBadge from "@/components/FreshnessBadge";
import CrowdVote from "@/components/CrowdVote";
import CompanyLogo from "@/components/CompanyLogo";
import AIAssistant from "@/components/AIAssistant";

interface CenterDetail {
  id: string;
  name: string;
  category: string;
  tel: string | null;
  tel_short: string | null;
  hours: string;
  ars_tree: Record<string, unknown>;
  shortcuts: Record<string, string>;
  alternatives: Array<{
    type: string;
    name: string;
    path?: string;
    url?: string | null;
    solves: string[];
  }>;
  avg_wait: {
    weekday_am: number | null;
    weekday_pm: number | null;
    weekday_lunch: number | null;
    weekend: number | null;
  };
  tips: string[];
  satisfaction: number;
  freshness: {
    last_verified: string;
    verified_by: number;
    reports_incorrect: number;
    status: string;
  };
}

export default function CenterDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [center, setCenter] = useState<CenterDetail | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    import(`@/data/centers/${id}.json`)
      .then((mod) => setCenter(mod.default))
      .catch(() => setCenter(null));
  }, [id]);

  if (!center) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F4F5F7]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#3182F6] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F5F7]">
      {/* Header with white background */}
      <div className="bg-white sticky top-0 z-10 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="px-5 pt-4 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.back()} 
              className="w-9 h-9 rounded-full hover:bg-[#F4F5F7] flex items-center justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-[#191F28]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <CompanyLogo centerId={id} size="md" />
            <div className="flex-1">
              <h1 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">{center.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[12px] text-[#8B95A1]">{center.category}</span>
                <FreshnessBadge freshness={center.freshness} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-5 pt-5 pb-8">
        {/* Contact info card */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] p-5 mb-5">
          {center.tel && (
            <a href={`tel:${center.tel.replace(/-/g, "")}`} className="flex items-center gap-3 mb-4 pb-4 border-b border-[#F4F5F7]">
              <div className="w-10 h-10 rounded-full bg-[#E3F2FF] flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-[#3182F6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-[12px] text-[#8B95A1] mb-1">전화번호</p>
                <p className="text-[17px] font-bold text-[#191F28]">{center.tel}</p>
                {center.tel_short && <p className="text-[12px] text-[#8B95A1] mt-1">{center.tel_short}</p>}
              </div>
            </a>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8F8F5] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-[#00C785]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-[#8B95A1] mb-1">운영시간</p>
              <p className="text-[17px] font-bold text-[#191F28]">{center.hours}</p>
            </div>
          </div>
        </div>

        {/* ARS Shortcuts */}
        {Object.keys(center.shortcuts).length > 0 && (
          <div className="mb-5">
            <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3">상담원 최단 경로</h2>
            <div className="space-y-2">
              {Object.entries(center.shortcuts).map(([key, path]) => (
                <div 
                  key={key} 
                  className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3 flex items-center justify-between"
                >
                  <span className="text-[15px] font-semibold text-[#191F28]">{key}</span>
                  <span className="font-mono font-bold text-[#3182F6] text-[15px]">{path}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q헬퍼 - primary position */}
        <div className="mb-5">
          <AIAssistant centerId={center.id} centerName={center.name} />
        </div>

        {/* More info toggle */}
        {(center.tips.length > 0 || center.alternatives.length > 0) && (
          <button
            onClick={() => setShowMore(!showMore)}
            className="w-full py-3 text-[15px] text-[#8B95A1] hover:text-[#4E5968] flex items-center justify-center gap-2 mb-5 transition-colors"
          >
            {showMore ? "접기" : "더 보기 (꿀팁, 대안)"}
            <svg className={`w-4 h-4 transition-transform ${showMore ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}

        {/* Collapsible sections */}
        {showMore && (
          <>
            {/* Tips */}
            {center.tips.length > 0 && (
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3">사용자 꿀팁</h2>
                <div className="space-y-2">
                  {center.tips.map((tip, i) => (
                    <div 
                      key={i} 
                      className="bg-[#FFF8E6] rounded-[12px] px-4 py-3 flex items-start gap-3"
                    >
                      <span className="text-[18px] mt-0.5 shrink-0">💡</span>
                      <p className="text-[15px] text-[#191F28]">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {center.alternatives.length > 0 && (
              <div className="mb-5">
                <h2 className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px] mb-3">전화 없이 해결</h2>
                <div className="space-y-2">
                  {center.alternatives.map((alt, i) => (
                    <div 
                      key={i} 
                      className="bg-white rounded-[12px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] px-4 py-3"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-[11px] font-bold text-[#8B95A1] uppercase mt-0.5 w-10 shrink-0 bg-[#F4F5F7] px-2 py-1 rounded">
                          {alt.type === "app" ? "APP" : alt.type === "web" ? "WEB" : "CHAT"}
                        </span>
                        <div className="flex-1">
                          <p className="text-[15px] font-semibold text-[#191F28]">{alt.name}</p>
                          {alt.path && <p className="text-[12px] text-[#8B95A1] mt-1">{alt.path}</p>}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alt.solves.map((s) => (
                              <span 
                                key={s} 
                                className="text-[11px] bg-[#F4F5F7] text-[#4E5968] px-2 py-1 rounded-[6px]"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                        {alt.url && (
                          <a 
                            href={alt.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="shrink-0 text-[#8B95A1] hover:text-[#3182F6] transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Crowd vote */}
        <CrowdVote centerId={center.id} />
      </div>
    </div>
  );
}
