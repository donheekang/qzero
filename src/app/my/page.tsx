"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface RecentSearch {
  query: string;
  timestamp?: number;
}

interface Favorite {
  id: string;
  name: string;
  category: string;
}

export default function MyPage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState(false);

  /* 로컬스토리지에서 데이터 로드 */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("qzero_recent") || "[]") as string[];
      setRecentSearches(saved.map((q) => ({ query: q })));
    } catch { /* noop */ }

    try {
      const fav = JSON.parse(localStorage.getItem("qzero_favorites") || "[]") as Favorite[];
      setFavorites(fav);
    } catch { /* noop */ }

    try {
      setNotifications(localStorage.getItem("qzero_notif") === "true");
    } catch { /* noop */ }
  }, []);

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("qzero_recent");
  };

  const removeFavorite = (id: string) => {
    const updated = favorites.filter((f) => f.id !== id);
    setFavorites(updated);
    localStorage.setItem("qzero_favorites", JSON.stringify(updated));
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("qzero_notif", String(next));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-5 pb-4">
        <h1 className="text-[22px] font-extrabold text-[#191F28] tracking-[-0.6px]">마이</h1>
      </header>

      {/* Profile card */}
      <div className="px-5 pb-5">
        <div className="bg-[#F4F5F7] rounded-2xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#EAEBEE] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#B0B8C1]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path strokeLinecap="round" d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[16px] font-bold text-[#191F28]">게스트</p>
              <p className="text-[13px] text-[#8B95A1] mt-0.5">로그인하면 데이터가 동기화돼요</p>
            </div>
          </div>
          <button className="w-full mt-4 py-2.5 bg-[#191F28] text-white rounded-xl text-[14px] font-semibold hover:bg-[#0F1419] transition-colors">
            로그인 / 회원가입
          </button>
        </div>
      </div>

      <div className="h-2 bg-[#F4F5F7]" />

      {/* 최근 검색 */}
      <section className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-bold text-[#191F28] tracking-[-0.3px]">최근 검색</h2>
          {recentSearches.length > 0 && (
            <button
              onClick={clearRecentSearches}
              className="text-[13px] text-[#8B95A1] hover:text-[#F04452] transition-colors"
            >
              전체 삭제
            </button>
          )}
        </div>
        {recentSearches.length === 0 ? (
          <p className="text-[14px] text-[#B0B8C1] py-6 text-center">최근 검색 기록이 없어요</p>
        ) : (
          <div className="space-y-0">
            {recentSearches.slice(0, 10).map((item, i) => (
              <button
                key={i}
                onClick={() => router.push(`/search?q=${encodeURIComponent(item.query)}`)}
                className="flex items-center gap-3 py-3 w-full text-left border-b border-[#F4F5F7] last:border-b-0 hover:bg-[#FAFBFC] transition-colors -mx-1 px-1 rounded"
              >
                <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="7" />
                  <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
                </svg>
                <span className="text-[14px] text-[#4E5968] flex-1 truncate">{item.query}</span>
                <svg className="w-3.5 h-3.5 text-[#D1D6DB] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="h-2 bg-[#F4F5F7]" />

      {/* 즐겨찾기 */}
      <section className="px-5 pt-5 pb-4">
        <h2 className="text-[16px] font-bold text-[#191F28] tracking-[-0.3px] mb-3">즐겨찾기</h2>
        {favorites.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-[14px] text-[#B0B8C1] mb-1">즐겨찾기한 고객센터가 없어요</p>
            <p className="text-[13px] text-[#D1D6DB]">고객센터 상세 페이지에서 추가할 수 있어요</p>
          </div>
        ) : (
          <div className="space-y-0">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="flex items-center gap-3 py-3 border-b border-[#F4F5F7] last:border-b-0"
              >
                <button
                  onClick={() => router.push(`/center/${fav.id}`)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#F4F5F7] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[#F59F00]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-[#191F28] truncate">{fav.name}</p>
                    <p className="text-[12px] text-[#B0B8C1]">{fav.category}</p>
                  </div>
                </button>
                <button
                  onClick={() => removeFavorite(fav.id)}
                  className="p-2 text-[#B0B8C1] hover:text-[#F04452] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="h-2 bg-[#F4F5F7]" />

      {/* 설정 */}
      <section className="px-5 pt-5 pb-8">
        <h2 className="text-[16px] font-bold text-[#191F28] tracking-[-0.3px] mb-3">설정</h2>
        <div className="space-y-0">
          {/* 알림 */}
          <div className="flex items-center justify-between py-3.5 border-b border-[#F4F5F7]">
            <div>
              <p className="text-[14px] font-medium text-[#191F28]">푸시 알림</p>
              <p className="text-[12px] text-[#8B95A1] mt-0.5">대기 시간 줄었을 때 알려드려요</p>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-[46px] h-[26px] rounded-full transition-colors relative ${
                notifications ? "bg-[#3182F6]" : "bg-[#D1D6DB]"
              }`}
            >
              <div className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm absolute top-[2px] transition-transform ${
                notifications ? "translate-x-[22px]" : "translate-x-[2px]"
              }`} />
            </button>
          </div>

          {/* 메뉴 항목들 */}
          {[
            { label: "이용약관", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "개인정보 처리방침", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
            { label: "문의하기", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
            { label: "버전 정보", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((item) => (
            <button
              key={item.label}
              className="flex items-center gap-3 py-3.5 w-full text-left border-b border-[#F4F5F7] last:border-b-0"
            >
              <svg className="w-5 h-5 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-[14px] text-[#4E5968] flex-1">{item.label}</span>
              <svg className="w-4 h-4 text-[#D1D6DB] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>

        {/* App version */}
        <p className="text-center text-[12px] text-[#D1D6DB] mt-6">Qzero v1.0.0</p>
      </section>
    </div>
  );
}
