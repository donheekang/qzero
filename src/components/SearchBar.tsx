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

export default function SearchBar({
  placeholder = "어떤 고객센터 문제가 있으신가요?",
  autoFocus = false,
  initialValue = "",
  size = "lg",
  onSearch,
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<{ id: string; name: string }[]>([]);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const handleChange = async (value: string) => {
    setQuery(value);
    if (value.length >= 1) {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}&mode=suggest`);
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSuggestions([]);
      if (onSearch) onSearch(query.trim());
      else router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    if (onSearch) onSearch(name);
    else router.push(`/search?q=${encodeURIComponent(name)}`);
  };

  const lg = size === "lg";

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className={`relative flex items-center ${lg ? "h-[52px]" : "h-[44px]"}`}>
        <svg
          className={`absolute left-[14px] ${lg ? "w-[18px] h-[18px]" : "w-4 h-4"} text-[#B0B8C1]`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" />
          <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full bg-[#F4F5F7] border-0 text-[#191F28] placeholder-[#B0B8C1] search-input transition-all duration-200 ${
            lg
              ? "h-[52px] pl-11 pr-4 text-[15px] rounded-[14px]"
              : "h-[44px] pl-10 pr-4 text-[14px] rounded-[12px]"
          } tracking-[-0.3px] font-medium focus:bg-white`}
        />
      </div>

      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
          {suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSuggestionClick(s.name)}
              className="w-full px-4 py-3 text-left text-[14px] font-medium text-[#191F28] hover:bg-[#F8F9FA] transition-colors flex items-center gap-2.5 tracking-[-0.3px]"
            >
              <svg className="w-4 h-4 text-[#B0B8C1] shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="6" />
                <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
              </svg>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
