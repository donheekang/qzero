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
        <div className="bg-gradient-to-br from-[#E5FFF3] to-[#F0FFFA] rounded-[16px] p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-[#00C785] text-white rounded-full px-3 py-1">
              <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" /></svg>
              <span className="text-sm font-semibold">전화 안 해도 돼요!</span>
            </div>
          </div>
          <p className="text-[#4E5968] text-sm mb-4">{solution.description}</p>
          {solution.steps && solution.steps.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-xs font-medium text-gray-400 uppercase">{solution.alternative.type === "app" ? "APP" : solution.alternative.type === "web" ? "WEB" : "CHAT"}</span>
                <span className="font-medium text-sm text-[#4E5968]">{solution.alternative.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {solution.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-[#00C785] font-bold">›</span>}
                    <span className="px-3 py-1.5 bg-white/80 rounded-lg text-[13px] font-semibold text-[#4E5968]">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {solution.alternative.url && (
            <a
              href={solution.alternative.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3.5 bg-[#00C785] hover:bg-[#00A870] text-white rounded-[12px] text-center text-[15px] font-semibold transition-colors"
            >
              {solution.alternative.name} 열기
            </a>
          )}
        </div>
      )}

      {/* Call solution */}
      {hasCall && (
        <div className="bg-[#F4F5F7] rounded-[16px] p-5">
          <h3 className="font-semibold text-[#191F28] mb-4">{hasNoCal ? "그래도 전화하려면" : "전화로 해결하세요"}</h3>
          {center.tel && (
            <a href={`tel:${center.tel.replace(/-/g, "")}`} className="block mb-4">
              <p className="text-[22px] font-extrabold text-[#191F28] tracking-[-0.5px]">{center.tel}</p>
              {center.tel_short && <p className="text-xs text-[#8B92A3] mt-1.5">{center.tel_short}</p>}
            </a>
          )}
          {solution.arsPath && (
            <div className="mb-3">
              <p className="text-xs font-medium text-[#8B92A3] uppercase mb-1.5">ARS 경로</p>
              <div className="bg-[#E8F3FF] rounded-lg px-3 py-1.5 inline-block">
                <span className="font-mono font-bold text-[#3182F6] text-sm">{solution.arsPath}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2 mb-4">
            {solution.estimatedWait !== null && solution.estimatedWait !== undefined && (
              <div className="bg-white rounded-lg px-3.5 py-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#8B92A3] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[13px] text-[#4E5968]">지금 대기 약 <strong>{solution.estimatedWait}분</strong></span>
              </div>
            )}
            {solution.bestTime && (
              <div className="bg-white rounded-lg px-3.5 py-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00C785] shrink-0" />
                <span className="text-[13px] text-[#4E5968]">{solution.bestTime}</span>
              </div>
            )}
          </div>
          {center.tel && (
            <a
              href={`tel:${center.tel.replace(/-/g, "")}`}
              className="block w-full py-3.5 bg-[#191F28] hover:bg-[#0D1013] text-white text-center rounded-[12px] text-[15px] font-semibold transition-colors"
            >
              지금 전화하기
            </a>
          )}
        </div>
      )}
    </div>
  );
}
