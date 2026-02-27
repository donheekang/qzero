"use client";

interface PremiumLockProps {
  feature: string;
  title: string;
  description: string;
  icon: string;
  previewContent?: string;
}

export default function PremiumLock({ feature, title, description, icon, previewContent }: PremiumLockProps) {
  return (
    <div className="relative bg-gradient-to-br from-[#F8F9FB] to-[#F0F2F5] rounded-[20px] overflow-hidden">
      {/* Blurred preview */}
      {previewContent && (
        <div className="p-5 premium-blur">
          <p className="text-[14px] text-[#4E5968] leading-relaxed">{previewContent}</p>
        </div>
      )}

      {/* Lock overlay */}
      <div className={`${previewContent ? "absolute inset-0 premium-overlay" : ""} flex flex-col items-center justify-center p-6`}>
        <div className="w-12 h-12 bg-[#EAEBEE] rounded-full flex items-center justify-center mb-3">
          <span className="text-[12px] font-bold text-[#8B95A1] tracking-wide">{icon}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 text-[#8B95A1]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <h4 className="text-[16px] font-bold text-[#191F28] tracking-[-0.3px]">{title}</h4>
        </div>
        <p className="text-[14px] text-[#8B95A1] text-center mb-4">{description}</p>
        <button className="px-6 py-3 bg-gradient-to-r from-[#00E59B] via-[#00C785] to-[#3182F6] text-white text-[14px] font-bold rounded-full hover:shadow-lg transition-shadow">
          월 2,900원으로 잠금 해제
        </button>
      </div>
    </div>
  );
}
