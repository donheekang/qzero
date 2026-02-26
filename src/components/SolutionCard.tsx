interface SolutionCardProps {
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
  };
  center: {
    id: string;
    name: string;
    tel: string | null;
    tel_short: string | null;
    hours: string;
  };
}

export default function SolutionCard({ solution, center }: SolutionCardProps) {
  const hasNoCal = solution.type === "no_call" || solution.type === "both";
  const hasCall = solution.type === "call" || solution.type === "both";

  return (
    <div className="space-y-4">
      {/* No-call solution */}
      {hasNoCal && solution.alternative && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </span>
            <h3 className="font-bold text-emerald-800 text-lg">{solution.title}</h3>
          </div>
          <p className="text-emerald-700 text-sm mb-3">{solution.description}</p>
          {solution.steps && solution.steps.length > 0 && (
            <div className="bg-white rounded-xl p-4 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase">{solution.alternative.type === "app" ? "APP" : solution.alternative.type === "web" ? "WEB" : "CHAT"}</span>
                <span className="font-medium text-sm">{solution.alternative.name}</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                {solution.steps.map((step, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-gray-400">›</span>}
                    <span>{step}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {solution.alternative.url && (
            <a
              href={solution.alternative.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#00E59B] text-white text-sm font-medium rounded-xl hover:bg-[#00C785] transition-colors"
            >
              {solution.alternative.name} 열기
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      )}

      {/* Call solution */}
      {hasCall && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            <h3 className="font-semibold text-gray-800">{hasNoCal ? "그래도 전화하려면" : "전화로 해결하세요"}</h3>
          </div>
          {center.tel && (
            <a href={`tel:${center.tel.replace(/-/g, "")}`} className="block bg-gray-50 rounded-xl p-4 mb-3">
              <p className="text-xl font-bold text-gray-900">{center.tel}</p>
              {center.tel_short && <p className="text-xs text-gray-500 mt-1">{center.tel_short}</p>}
            </a>
          )}
          {solution.arsPath && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm text-gray-500">ARS:</span>
              <span className="font-mono font-bold text-[#00E59B]">{solution.arsPath}</span>
            </div>
          )}
          {solution.estimatedWait !== null && solution.estimatedWait !== undefined && (
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className="text-sm text-gray-600">지금 대기 약 <strong>{solution.estimatedWait}분</strong></span>
            </div>
          )}
          {solution.bestTime && (
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00E59B] shrink-0" />
              <span className="text-sm text-gray-600">{solution.bestTime}</span>
            </div>
          )}
          {center.tel && (
            <a
              href={`tel:${center.tel.replace(/-/g, "")}`}
              className="mt-4 flex items-center justify-center gap-2 w-full py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              지금 전화하기
            </a>
          )}
        </div>
      )}
    </div>
  );
}
