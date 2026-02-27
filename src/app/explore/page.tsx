"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CompanyLogo from "@/components/CompanyLogo";

/* ── 고객센터 데이터 (서버 import 대신 클라이언트용 경량 목록) ── */
const ALL_CENTERS = [
  // 통신
  { id: "skt", name: "SKT", category: "통신", tel: "080-011-6000" },
  { id: "kt", name: "KT", category: "통신", tel: "100" },
  { id: "lguplus", name: "LG U+", category: "통신", tel: "1544-0010" },
  // 은행
  { id: "kbbank", name: "KB국민은행", category: "은행", tel: "1588-9999" },
  { id: "shinhanbank", name: "신한은행", category: "은행", tel: "1577-8000" },
  { id: "hanabank", name: "하나은행", category: "은행", tel: "1599-1111" },
  { id: "wooribank", name: "우리은행", category: "은행", tel: "1588-5000" },
  { id: "nonghyup", name: "NH농협은행", category: "은행", tel: "1661-3000" },
  { id: "kakaobank", name: "카카오뱅크", category: "은행", tel: "1599-3333" },
  { id: "kbank", name: "K뱅크", category: "은행", tel: "1522-1000" },
  { id: "toss", name: "토스", category: "은행", tel: "1599-4905" },
  // 카드
  { id: "samsungcard", name: "삼성카드", category: "카드", tel: "1588-8700" },
  { id: "hyundaicard", name: "현대카드", category: "카드", tel: "1577-6000" },
  { id: "kbcard", name: "KB국민카드", category: "카드", tel: "1588-1688" },
  { id: "shinhancard", name: "신한카드", category: "카드", tel: "1544-7000" },
  { id: "lottecard", name: "롯데카드", category: "카드", tel: "1588-8100" },
  // 보험
  { id: "samsunglife", name: "삼성생명", category: "보험", tel: "1588-3114" },
  { id: "hyundaiins", name: "현대해상", category: "보험", tel: "1588-5656" },
  { id: "dbins", name: "DB손해보험", category: "보험", tel: "1588-0100" },
  // 공공
  { id: "nhis", name: "건강보험공단", category: "공공", tel: "1577-1000" },
  { id: "nps", name: "국민연금공단", category: "공공", tel: "1355" },
  { id: "gov24", name: "정부24", category: "공공", tel: "110" },
  { id: "nts", name: "국세청", category: "공공", tel: "126" },
  { id: "ei", name: "고용노동부", category: "공공", tel: "1350" },
  // 쇼핑
  { id: "coupang", name: "쿠팡", category: "쇼핑", tel: "1577-7011" },
  { id: "11st", name: "11번가", category: "쇼핑", tel: "1599-0011" },
  { id: "musinsa", name: "무신사", category: "쇼핑", tel: null },
  { id: "gmarket", name: "G마켓", category: "쇼핑", tel: "1566-6255" },
  { id: "ssg", name: "SSG닷컴", category: "쇼핑", tel: "1577-3419" },
  { id: "oliveyoung", name: "올리브영", category: "쇼핑", tel: "080-060-0060" },
  { id: "daiso", name: "다이소", category: "쇼핑", tel: "1522-4400" },
  { id: "ohouse", name: "오늘의집", category: "쇼핑", tel: null },
  // 배달
  { id: "baemin", name: "배달의민족", category: "배달", tel: "1600-0987" },
  { id: "yogiyo", name: "요기요", category: "배달", tel: "1661-5270" },
  // IT/플랫폼
  { id: "naver", name: "네이버", category: "IT", tel: "1588-3820" },
  { id: "kakao", name: "카카오", category: "IT", tel: "1577-3754" },
  { id: "netflix", name: "넷플릭스", category: "IT", tel: null },
  { id: "disneyplus", name: "디즈니+", category: "IT", tel: null },
  // 항공/여행
  { id: "koreanair", name: "대한항공", category: "여행", tel: "1588-2001" },
  { id: "asiana", name: "아시아나", category: "여행", tel: "1588-8000" },
  { id: "yanolja", name: "야놀자", category: "여행", tel: "1644-1346" },
  { id: "yeogi", name: "여기어때", category: "여행", tel: "1670-7777" },
  // 택배
  { id: "cjlogistics", name: "CJ대한통운", category: "택배", tel: "1588-1255" },
  { id: "hanjin", name: "한진택배", category: "택배", tel: "1588-0011" },
  { id: "logen", name: "로젠택배", category: "택배", tel: "1588-9988" },
  // 전자/자동차
  { id: "samsung", name: "삼성전자", category: "전자", tel: "1588-3366" },
  { id: "lg", name: "LG전자", category: "전자", tel: "1544-7777" },
  { id: "apple", name: "Apple", category: "전자", tel: "080-333-4000" },
  { id: "hyundaicar", name: "현대자동차", category: "자동차", tel: "080-600-6000" },
  { id: "kia", name: "기아", category: "자동차", tel: "080-200-2000" },
];

const CATEGORIES = ["전체", "통신", "은행", "카드", "보험", "공공", "쇼핑", "배달", "IT", "여행", "택배", "전자", "자동차"];

export default function ExplorePage() {
  const router = useRouter();
  const [category, setCategory] = useState("전체");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = ALL_CENTERS;
    if (category !== "전체") {
      list = list.filter((c) => c.category === category);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.category.includes(q)
      );
    }
    return list;
  }, [category, search]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-5 pb-2">
        <h1 className="text-[22px] font-extrabold text-[#191F28] tracking-[-0.6px]">고객센터 탐색</h1>
        <p className="text-[14px] text-[#8B95A1] mt-1">{ALL_CENTERS.length}개 고객센터 정보를 한눈에</p>
      </header>

      {/* Search */}
      <div className="px-5 py-3">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B8C1]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="고객센터 이름으로 검색"
            className="w-full pl-10 pr-4 py-2.5 bg-[#F4F5F7] rounded-xl text-[14px] text-[#191F28] placeholder-[#B0B8C1] focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#B0B8C1] flex items-center justify-center"
            >
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 px-5 pb-4 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-3.5 py-[7px] rounded-full text-[13px] font-medium transition-colors ${
              category === cat
                ? "bg-[#191F28] text-white"
                : "bg-[#F4F5F7] text-[#8B95A1] hover:bg-[#EAEBEE]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="px-5 pb-2">
        <span className="text-[13px] text-[#8B95A1]">{filtered.length}개</span>
      </div>

      {/* Center list */}
      <div className="px-5 pb-8">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[15px] text-[#8B95A1]">검색 결과가 없어요</p>
          </div>
        ) : (
          <div className="space-y-0">
            {filtered.map((center) => (
              <button
                key={center.id}
                onClick={() => router.push(`/center/${center.id}`)}
                className="flex items-center gap-3.5 py-3.5 w-full text-left border-b border-[#F4F5F7] last:border-b-0 hover:bg-[#FAFBFC] transition-colors -mx-2 px-2 rounded-lg"
              >
                <CompanyLogo centerId={center.id} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-semibold text-[#191F28] tracking-[-0.3px]">{center.name}</span>
                    <span className="text-[12px] text-[#B0B8C1] bg-[#F4F5F7] px-1.5 py-0.5 rounded">{center.category}</span>
                  </div>
                  {center.tel && (
                    <p className="text-[13px] text-[#8B95A1] mt-0.5">{center.tel}</p>
                  )}
                </div>
                <svg className="w-4 h-4 text-[#D1D6DB] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
