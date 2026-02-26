"use client";
import { useState, useEffect } from "react";

interface CrowdVoteProps {
  centerId: string;
  field?: string;
}

export default function CrowdVote({ centerId, field = "general" }: CrowdVoteProps) {
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [reportCategory, setReportCategory] = useState("");
  const [reportMemo, setReportMemo] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [voteCount, setVoteCount] = useState({ up: 0, down: 0 });

  // 투표 집계 불러오기
  useEffect(() => {
    fetch(`/api/vote?centerId=${centerId}`)
      .then((res) => res.json())
      .then((data) => {
        setVoteCount({ up: data.upCount || 0, down: data.downCount || 0 });
      })
      .catch(() => {});
  }, [centerId]);

  const handleVote = async (type: "up" | "down") => {
    setVoted(type);
    setVoteCount((prev) => ({
      ...prev,
      [type === "up" ? "up" : "down"]: prev[type === "up" ? "up" : "down"] + 1,
    }));
    if (type === "down") setShowReport(true);

    try {
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ centerId, voteType: type }),
      });
    } catch (err) {
      console.error("Vote failed:", err);
    }
  };

  const handleReport = async () => {
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId,
          category: reportCategory,
          memo: reportMemo || undefined,
        }),
      });
    } catch (err) {
      console.error("Report failed:", err);
    }
    setSubmitted(true);
    setShowReport(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-3">
        <p className="text-sm text-gray-500">제보해주셔서 감사합니다. 확인 후 반영할게요.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-4">
      {!voted ? (
        <div className="flex items-center justify-center gap-6">
          <span className="text-sm text-gray-500">이 정보 도움됐나요?</span>
          <button
            onClick={() => handleVote("up")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
          >
            맞아요{voteCount.up > 0 && <span className="text-xs text-gray-400">{voteCount.up}</span>}
          </button>
          <button
            onClick={() => handleVote("down")}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 bg-gray-50 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            틀려요{voteCount.down > 0 && <span className="text-xs text-gray-400">{voteCount.down}</span>}
          </button>
        </div>
      ) : voted === "up" ? (
        <p className="text-center text-sm text-gray-500">감사합니다. 데이터 정확도 향상에 도움이 돼요.</p>
      ) : null}

      {/* Report modal */}
      {showReport && (
        <div className="mt-3 bg-gray-50 rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-3">어떤 점이 달랐나요?</p>
          <div className="flex flex-wrap gap-2 mb-3">
            {[
              { value: "wrong_menu", label: "메뉴 번호가 달라요" },
              { value: "not_connected", label: "연결이 안 돼요" },
              { value: "hours_changed", label: "운영시간이 바뀌었어요" },
              { value: "other", label: "기타" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setReportCategory(opt.value)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                  reportCategory === opt.value
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={reportMemo}
            onChange={(e) => setReportMemo(e.target.value)}
            placeholder="추가 메모 (선택)"
            className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#00E59B] mb-3"
          />
          <button
            onClick={handleReport}
            disabled={!reportCategory}
            className="w-full py-2 text-sm font-medium text-white bg-gray-900 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
          >
            제보하기
          </button>
        </div>
      )}
    </div>
  );
}
