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
    <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Blurred preview */}
      {previewContent && (
        <div className="p-5 premium-blur">
          <p className="text-sm text-gray-600 leading-relaxed">{previewContent}</p>
        </div>
      )}

      {/* Lock overlay */}
      <div className={`${previewContent ? "absolute inset-0 premium-overlay" : ""} flex flex-col items-center justify-center p-6`}>
        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
          <span className="text-xs font-bold text-gray-500 tracking-wide">{icon}</span>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <h4 className="font-semibold text-gray-800">{title}</h4>
        </div>
        <p className="text-sm text-gray-500 text-center mb-4">{description}</p>
        <button className="px-6 py-2.5 bg-gradient-to-r from-[#00E59B] to-[#00C785] text-white text-sm font-medium rounded-xl hover:shadow-lg transition-shadow">
          월 2,900원으로 잠금 해제
        </button>
      </div>
    </div>
  );
}
