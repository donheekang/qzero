"use client";
import { useState, useEffect, useCallback } from "react";

interface WaitTimerProps {
  centerName: string;
  estimatedWait?: number | null;
  arsPath?: string;
  scriptHint?: string;
}

export default function WaitTimer({ centerName, estimatedWait, arsPath, scriptHint }: WaitTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!isRunning || connected) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning, connected]);

  const formatTime = useCallback((s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }, []);

  const estimatedRemaining = estimatedWait ? Math.max(0, estimatedWait * 60 - seconds) : null;

  if (connected) {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#D3F9D8] flex items-center justify-center">
            <svg className="w-10 h-10 text-[#40C057]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
          </div>
        </div>
        <h2 className="text-[22px] font-extrabold text-[#191F28] mb-2">상담원 연결됨!</h2>
        <p className="text-[14px] text-[#8B95A1] mb-6">대기 시간: {formatTime(seconds)}</p>
        {scriptHint && (
          <div className="bg-[#E8F3FF] rounded-[16px] p-4 text-left">
            <p className="text-[12px] text-[#3182F6] font-medium mb-2">상담 시 말할 멘트</p>
            <p className="text-[14px] text-[#1B64DA]">{scriptHint}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Timer Circle */}
      <div className="flex justify-center mb-8">
        <div className="relative w-[220px] h-[220px]">
          {/* Outer animated ring */}
          <div className="absolute inset-0 rounded-full timer-rotate" style={{
            background: 'conic-gradient(from 0deg, #3182F6, #00C785, #F59F00, #3182F6)',
          }} />
          
          {/* Inner white circle with content */}
          <div className="absolute inset-1 rounded-full bg-white flex flex-col items-center justify-center">
            <p className="text-[48px] font-extrabold text-[#191F28] tracking-[-2px] font-mono leading-none">
              {formatTime(seconds)}
            </p>
            {estimatedRemaining !== null && estimatedRemaining > 0 && (
              <p className="text-[14px] text-[#8B95A1] mt-2">
                예상: ~{Math.ceil(estimatedRemaining / 60)}분
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Center name */}
      <p className="text-[15px] text-[#8B95A1] tracking-[-0.3px] mb-2">
        {centerName} 고객센터 대기 중
      </p>

      {/* Status indicator */}
      <div className="flex items-center justify-center gap-1 mb-6">
        <div className="w-2 h-2 rounded-full bg-[#F59F00] animate-pulse" />
        <p className="text-[14px] text-[#F59F00]">대기 중</p>
      </div>

      {/* ARS path card */}
      {arsPath && (
        <div className="bg-[#F4F5F7] rounded-[16px] p-4 mb-4 text-left">
          <p className="text-[12px] text-[#8B95A1] mb-2">ARS 경로</p>
          <p className="font-mono font-bold text-[#3182F6]">{arsPath}</p>
        </div>
      )}

      {/* Script hint card */}
      {scriptHint && (
        <div className="bg-[#E8F3FF] rounded-[16px] p-4 mb-4 text-left">
          <p className="text-[12px] text-[#3182F6] font-medium mb-2">상담 시 말할 멘트</p>
          <p className="text-[14px] text-[#1B64DA]">{scriptHint}</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-gradient-to-br from-[#F0F7FF] to-[#E8F3FF] rounded-[16px] p-6 mb-6 flex flex-col items-center justify-center min-h-[120px]">
        <svg className="w-8 h-8 text-[#3182F6] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-[12px] text-[#8B95A1]">대기 중 맞춤 정보가 여기에 표시됩니다</p>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex-1 py-4 text-[15px] font-semibold bg-[#F4F5F7] text-[#4E5968] rounded-[12px] hover:bg-[#E8EAED] transition-colors"
        >
          {isRunning ? "일시정지" : "재개"}
        </button>
        <button
          onClick={() => setConnected(true)}
          className="flex-1 py-4 text-[15px] font-semibold bg-[#00C785] text-white rounded-[12px] hover:bg-[#00B876] transition-colors"
        >
          상담원 연결됨!
        </button>
      </div>
    </div>
  );
}
