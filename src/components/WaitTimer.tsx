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
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">상담원 연결됨!</h2>
        <p className="text-sm text-gray-500">대기 시간: {formatTime(seconds)}</p>
        {scriptHint && (
          <div className="mt-4 bg-blue-50 rounded-2xl p-4 text-left">
            <p className="text-xs text-blue-600 font-medium mb-1">상담 시 말할 멘트</p>
            <p className="text-sm text-blue-800">{scriptHint}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Timer display */}
      <div className="py-8">
        <p className="text-sm text-gray-500 mb-2">{centerName} 고객센터 대기 중</p>
        <p className="text-5xl font-bold text-gray-900 font-mono timer-pulse">
          {formatTime(seconds)}
        </p>
        {estimatedRemaining !== null && estimatedRemaining > 0 && (
          <p className="text-sm text-gray-500 mt-2">
            예상 남은 시간: ~{Math.ceil(estimatedRemaining / 60)}분
          </p>
        )}
      </div>

      {/* ARS path reminder */}
      {arsPath && (
        <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-left">
          <p className="text-xs text-gray-500 mb-1">ARS 경로</p>
          <p className="font-mono font-bold text-[#00E59B]">{arsPath}</p>
        </div>
      )}

      {/* Ad placeholder */}
      <div className="bg-gray-50 border border-gray-200 border-dashed rounded-2xl p-6 mb-4">
        <p className="text-xs text-gray-400">[광고 영역]</p>
        <p className="text-sm text-gray-500 mt-1">대기 중 맞춤 정보가 여기에 표시됩니다</p>
      </div>

      {/* Script hint */}
      {scriptHint && (
        <div className="bg-blue-50 rounded-2xl p-4 mb-4 text-left">
          <p className="text-xs text-blue-600 font-medium mb-1">상담 시 말할 멘트</p>
          <p className="text-sm text-blue-800">{scriptHint}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="flex-1 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
        >
          {isRunning ? "일시정지" : "재개"}
        </button>
        <button
          onClick={() => setConnected(true)}
          className="flex-1 py-3 text-sm font-medium bg-[#00E59B] text-white rounded-xl hover:bg-[#00C785] transition-colors"
        >
          상담원 연결됨!
        </button>
      </div>
    </div>
  );
}
