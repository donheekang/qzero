"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL에서 code 파라미터 확인
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorParam = url.searchParams.get("error");
        const errorDescription = url.searchParams.get("error_description");

        if (errorParam) {
          setError(errorDescription || "로그인 중 오류가 발생했어요.");
          return;
        }

        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError("인증 처리 중 오류가 발생했어요.");
            return;
          }
        }

        // 성공 — 마이페이지로 이동
        router.replace("/my");
      } catch {
        setError("로그인 처리 중 문제가 발생했어요.");
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5">
        <div className="w-12 h-12 rounded-2xl bg-[#FFF0F0] flex items-center justify-center mb-4">
          <svg className="w-6 h-6 text-[#F04452]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-[16px] font-bold text-[#191F28] mb-1">로그인 실패</p>
        <p className="text-[14px] text-[#8B95A1] text-center mb-6">{error}</p>
        <button
          onClick={() => router.replace("/my")}
          className="px-6 py-3 bg-[#191F28] text-white rounded-xl text-[14px] font-semibold"
        >
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#EAEBEE] border-t-[#3182F6] rounded-full animate-spin mb-4" />
      <p className="text-[14px] text-[#8B95A1]">로그인 처리 중...</p>
    </div>
  );
}
