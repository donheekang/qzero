import { getBrandInfo } from "@/lib/logos";

interface CompanyLogoProps {
  centerId: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  xs: { container: "w-8 h-8", text: "text-[10px]", radius: "rounded-lg" },
  sm: { container: "w-10 h-10", text: "text-xs", radius: "rounded-xl" },
  md: { container: "w-12 h-12", text: "text-sm", radius: "rounded-xl" },
  lg: { container: "w-14 h-14", text: "text-base", radius: "rounded-2xl" },
};

export default function CompanyLogo({ centerId, size = "md", className = "" }: CompanyLogoProps) {
  const brand = getBrandInfo(centerId);
  const s = SIZES[size];

  return (
    <div
      className={`${s.container} ${s.radius} flex items-center justify-center shrink-0 shadow-toss ${className}`}
      style={{
        background: `linear-gradient(135deg, ${brand.bgColor}, ${adjustColor(brand.bgColor, 20)})`,
      }}
    >
      <span
        className={`${s.text} font-extrabold leading-none`}
        style={{ color: brand.textColor }}
      >
        {brand.initial}
      </span>
    </div>
  );
}

// Helper to lighten a hex color for gradient effect
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
