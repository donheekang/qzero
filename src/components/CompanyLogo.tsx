import { getBrandInfo } from "@/lib/logos";

interface CompanyLogoProps {
  centerId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: { dot: "w-1.5 h-1.5", text: "text-[10px]" },
  sm: { dot: "w-2 h-2", text: "text-xs" },
  md: { dot: "w-2 h-2", text: "text-sm" },
  lg: { dot: "w-2.5 h-2.5", text: "text-base" },
};

export default function CompanyLogo({ centerId, size = "md", className = "" }: CompanyLogoProps) {
  const brand = getBrandInfo(centerId);
  const s = SIZES[size];

  return (
    <div className={`flex items-center gap-1.5 shrink-0 ${className}`}>
      <span
        className={`${s.dot} rounded-full shrink-0`}
        style={{ backgroundColor: brand.bgColor }}
      />
      <span className={`${s.text} font-semibold text-gray-800 leading-none`}>
        {brand.initial}
      </span>
    </div>
  );
}
