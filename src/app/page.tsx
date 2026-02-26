"use client";

import { useRouter } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import CompanyLogo from "@/components/CompanyLogo";

const POPULAR_CENTERS = [
  { id: "skt", name: "SKT", tag: "통신" },
  { id: "kbbank", name: "국민은행", tag: "은행" },
  { id: "samsungcard", name: "삼성카드", tag: "카드" },
  { id: "coupang", name: "쿠팡", tag: "쇼핑" },
  { id: "nhis", name: "건강보험", tag: "공공" },
  { id: "kakao", name: "카카오", tag: "IT" },
];

const TRENDING = [
  { query: "SKT 해지 방어 꿀팁" },
  { query: "삼성카드 한도 올리기" },
  { query: "쿠팡 반품 신청" },
  { query: "국민은행 대출 상담" },
];

export default function Home() {
  const router = useRouter();

  return (
    <div className="px-5 pt-16 pb-8">
      {/* Logo & Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          <span className="text-[#00E59B]">Q</span>zero
        </h1>
        <p className="text-gray-500 text-sm">고객센터, 더 이상 기다리지 마세요</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar autoFocus size="lg" />
      </div>

      {/* Popular Centers */}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">자주 찾는 고객센터</h2>
        <div className="grid grid-cols-3 gap-2">
          {POPULAR_CENTERS.map((c) => (
            <button
              key={c.id}
              onClick={() => router.push(`/center/${c.id}`)}
              className="flex flex-col items-center gap-1.5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors card-hover"
            >
              <CompanyLogo centerId={c.id} size="md" />
              <span className="text-xs font-medium text-gray-700">{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">최근 인기 검색</h2>
        <div className="space-y-2">
          {TRENDING.map((t, i) => (
            <button
              key={i}
              onClick={() => router.push(`/search?q=${encodeURIComponent(t.query)}`)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
            >
              <span className="text-sm font-bold text-gray-400 w-5">{i + 1}</span>
              <span className="text-sm text-gray-700">{t.query}</span>
              <svg className="w-4 h-4 text-gray-300 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-12">
        <p className="text-xs text-gray-400">
          Qzero는 공개된 고객센터 정보를 정리하여 제공합니다.
        </p>
        <p className="text-xs text-gray-400 mt-1">
          정보가 정확하지 않을 수 있으며, 사용자 제보로 개선됩니다.
        </p>
      </div>
    </div>
  );
}
