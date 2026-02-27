"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  initialValue?: string;
  size?: "lg" | "sm";
  onSearch?: (query: string) => void;
}

export default function SearchBar({ placeholder = "어떤 고객센터 문제가 있으신가요?", autoFocus = false, initialValue = "", size = "lg", onSearch }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<{id: string; name: string}[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // Auto-suggest as user types
  const handleChange = async (value: string) => {
    setQuery(value);
    if (value.length >= 1) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&mode=suggest`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSuggestions([]);
      if (onSearch) {
        onSearch(query.trim());
      } else {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    if (onSearch) {
      onSearch(name);
    } else {
      router.push(`/search?q=${encodeURIComponent(name)}`);
    }
  };

  const isLarge = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative flex items-center ${isLarge ? "h-[56px]" : "h-[48px]"}`}>
        {/* Search icon */}
        <svg className={`absolute left-4 ${isLarge ? "w-5 h-5" : "w-4 h-4"} text-[#8B95A1]`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full ${isLarge ? "h-[56px] pl-12 pr-4 text-[16px]" : "h-[48px] pl-10 pr-4 text-[15px]"} bg-[#F4F5F7] border border-gray-200 ${isLarge ? "rounded-[20px]" : "rounded-[16px]"} text-[#191F28] placeholder-[#B0B8C1] tracking-[-0.3px] search-input focus:outline-none focus:ring-2 focus:ring-[#3182F6]/20 focus:border-[#3182F6] transition-colors`}
        />
      </div>

      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-[16px] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-200">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSuggestionClick(s.name)}
              className="w-full px-4 py-3 text-left text-[15px] text-[#191F28] hover:bg-[#F4F5F7] transition-colors flex items-center gap-2 tracking-[-0.3px]"
            >
              <svg className="w-4 h-4 text-[#8B95A1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
