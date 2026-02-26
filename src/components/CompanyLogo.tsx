import { getBrandInfo, getLogoSrc } from "@/lib/logos";

interface CompanyLogoProps {
  centerId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: { container: "w-6 h-6", text: "text-[8px]", rounded: "rounded-md" },
  sm: { container: "w-8 h-8", text: "text-[10px]", rounded: "rounded-lg" },
  md: { container: "w-10 h-10", text: "text-xs", rounded: "rounded-xl" },
  lg: { container: "w-12 h-12", text: "text-sm", rounded: "rounded-2xl" },
};

export default function CompanyLogo({ centerId, size = "md", className = "" }: CompanyLogoProps) {
  const brand = getBrandInfo(centerId);
  const logoSrc = getLogoSrc(centerId);
  const s = SIZES[size];

  // 실제 로고 이미지가 있으면 img 태그 사용
  if (logoSrc) {
    return (
      <div className={`${s.container} ${s.rounded} overflow-hidden shrink-0 ${className}`}>
        <img
          src={logoSrc}
          alt={brand.id}
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  // 브랜드 컬러 + 이니셜 표시
  return (
    <div
      className={`${s.container} ${s.rounded} flex items-center justify-center shrink-0 ${className}`}
      style={{ backgroundColor: brand.bgColor }}
    >
      <span
        className={`${s.text} font-bold leading-none`}
        style={{ color: brand.textColor }}
      >
        {brand.initial}
      </span>
    </div>
  );
}
