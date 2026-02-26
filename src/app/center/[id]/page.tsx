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
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#00E59B] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-500 hover:text-gray-700">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <CompanyLogo centerId={id} size="md" />
        <div>
          <h1 className="text-xl font-bold text-gray-900">{center.name}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-gray-400">{center.category}</span>
            <FreshnessBadge freshness={center.freshness} />
          </div>
        </div>
      </div>

      {/* Contact - primary info */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-4">
        {center.tel && (
          <a href={`tel:${center.tel.replace(/-/g, "")}`} className="flex items-center gap-3 mb-3">
            <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <div>
              <p className="font-bold text-lg text-gray-900">{center.tel}</p>
              {center.tel_short && <p className="text-xs text-gray-500">{center.tel_short}</p>}
            </div>
          </a>
        )}
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="text-sm text-gray-600">{center.hours}</p>
        </div>
      </div>

      {/* ARS Shortcuts */}
      {Object.keys(center.shortcuts).length > 0 && (
        <div className="mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">상담원 최단 경로</h2>
          <div className="space-y-1.5">
            {Object.entries(center.shortcuts).map(([key, path]) => (
              <div key={key} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-700">{key}</span>
                <span className="font-mono font-bold text-[#00E59B] text-sm">{path}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Assistant - primary position */}
      <div className="mb-4">
        <AIAssistant centerId={center.id} centerName={center.name} />
      </div>

      {/* More info toggle */}
      {(center.tips.length > 0 || center.alternatives.length > 0) && (
        <button
          onClick={() => setShowMore(!showMore)}
          className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 mb-4"
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
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">사용자 꿀팁</h2>
              <div className="space-y-1.5">
                {center.tips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2 px-4 py-2.5 bg-yellow-50 rounded-xl">
                    <span className="text-yellow-500 mt-0.5 shrink-0">-</span>
                    <p className="text-sm text-gray-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {center.alternatives.length > 0 && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">전화 없이 해결</h2>
              <div className="space-y-1.5">
                {center.alternatives.map((alt, i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                    <span className="text-xs font-semibold text-gray-400 uppercase mt-0.5 w-10 shrink-0">
                      {alt.type === "app" ? "APP" : alt.type === "web" ? "WEB" : "CHAT"}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">{alt.name}</p>
                      {alt.path && <p className="text-xs text-gray-500 mt-0.5">{alt.path}</p>}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {alt.solves.map((s) => (
                          <span key={s} className="text-xs bg-white text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    {alt.url && (
                      <a href={alt.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-gray-400 hover:text-[#00E59B]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
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
  );
}
