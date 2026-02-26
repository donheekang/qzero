interface FreshnessBadgeProps {
  freshness: {
    last_verified: string;
    verified_by: number;
    reports_incorrect: number;
    status: string;
  };
}

export default function FreshnessBadge({ freshness }: FreshnessBadgeProps) {
  const daysSince = Math.floor(
    (Date.now() - new Date(freshness.last_verified).getTime()) / (1000 * 60 * 60 * 24)
  );

  const ratio = freshness.verified_by > 0 ? freshness.reports_incorrect / freshness.verified_by : 0;

  let status: "verified" | "stale" | "disputed";
  if (ratio > 0.3) status = "disputed";
  else if (daysSince > 30) status = "stale";
  else status = "verified";

  const config = {
    verified: {
      dotColor: "bg-emerald-500",
      label: `최근 검증 (${daysSince}일 전${freshness.verified_by > 0 ? `, ${freshness.verified_by}명 확인` : ""})`,
      className: "badge-verified",
    },
    stale: {
      dotColor: "bg-orange-400",
      label: `${daysSince}일간 미검증 | 정보가 변경됐을 수 있어요`,
      className: "badge-stale",
    },
    disputed: {
      dotColor: "bg-red-500",
      label: "부정확 제보 다수 | 현재 확인 중입니다",
      className: "badge-disputed",
    },
  };

  const c = config[status];

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${c.className}`}>
      <span className={`w-2 h-2 rounded-full ${c.dotColor}`} />
      <span>{c.label}</span>
    </div>
  );
}
