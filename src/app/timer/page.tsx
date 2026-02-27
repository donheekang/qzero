"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import WaitTimer from "@/components/WaitTimer";

function TimerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const centerId = searchParams.get("center") || "";
  const arsPath = searchParams.get("ars") || "";
  const purpose = searchParams.get("purpose") || "";

  // Map center ID to name (simple lookup)
  const centerNames: Record<string, string> = {
    skt: "SKT", kt: "KT", lguplus: "LG U+",
    kbbank: "KB국민은행", shinhanbank: "신한은행", hanabank: "하나은행",
    wooribank: "우리은행", nonghyup: "NH농협은행",
    samsungcard: "삼성카드", hyundaicard: "현대카드", kbcard: "KB국민카드",
    shinhancard: "신한카드", lottecard: "롯데카드",
    nhis: "건강보험공단", nps: "국민연금공단", gov24: "정부24",
    coupang: "쿠팡", baemin: "배달의민족", naver: "네이버", kakao: "카카오",
  };

  const centerName = centerNames[centerId] || centerId;

  // Estimated wait (rough lookup)
  const waitEstimates: Record<string, number> = {
    skt: 12, kt: 15, lguplus: 10, kbbank: 15, shinhanbank: 12,
    hanabank: 13, wooribank: 14, nonghyup: 16, samsungcard: 10,
    hyundaicard: 9, kbcard: 12, shinhancard: 11, lottecard: 11,
    nhis: 20, nps: 15, gov24: 12, coupang: 7, baemin: 8,
    kakao: 15,
  };

  const estimatedWait = waitEstimates[centerId] || 10;

  // Script hint based on purpose
  const scriptHints: Record<string, string> = {
    "해지": `"${centerName} 서비스 해지 문의입니다. 해지 절차 안내 부탁드립니다."`,
    "요금문의": `"요금 관련 문의가 있어서 전화드렸습니다."`,
    "요금제변경": `"현재 요금제에서 다른 요금제로 변경하고 싶습니다."`,
    "환불": `"환불 처리 요청드립니다."`,
    "반품": `"반품/교환 신청하려고 합니다."`,
    "분실": `"분실 신고 접수하려고 합니다."`,
    "한도": `"카드 한도 상향 요청드립니다."`,
  };

  const scriptHint = purpose ? scriptHints[purpose] || `"${purpose} 관련 문의입니다."` : undefined;

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-6 pb-8">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[#4E5968] hover:bg-[#F4F5F7] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-[17px] font-bold text-[#191F28]">대기 타이머</h1>
      </div>

      <div className="px-5 pb-8">
        {/* Timer */}
        <WaitTimer
          centerName={centerName}
          estimatedWait={estimatedWait}
          arsPath={arsPath}
          scriptHint={scriptHint}
        />
      </div>
    </div>
  );
}

export default function TimerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-[#F4F5F7] border-t-[#00C785] rounded-full animate-spin" />
      </div>
    }>
      <TimerContent />
    </Suspense>
  );
}
