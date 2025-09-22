'use client';

import { MapboxSearchResult, searchLocations } from '@/lib/mapbox';
import { useEffect, useRef, useState } from 'react';
import { HiLocationMarker } from 'react-icons/hi';

interface LocationAutocompleteProps {
  onSelect: (location: { city: string; country: string; location_id: string } | null) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

export default function LocationAutocomplete({
  onSelect,
  error,
  disabled = false,
  placeholder,
}: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<MapboxSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 검색 디바운싱
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (inputValue.trim().length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchLocations(inputValue);
          setSuggestions(results);
          setIsOpen(true);
        } catch (error) {
          console.error('Location search error:', error);
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setIsOpen(false);
        // input이 비워지면 선택 해제 알림
        if (inputValue.trim().length === 0) {
          onSelect(null);
        }
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSelect]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: MapboxSearchResult) => {
    // 도시명과 국가명 추출
    const city = suggestion.text;
    const country = suggestion.context?.find((c) => c.id.startsWith('country'))?.text || '';

    onSelect({
      city,
      country,
      location_id: suggestion.id,
    });

    setInputValue(city); // 도시명만 표시
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={handleInputFocus}
          disabled={disabled}
          className={`w-full px-4 py-3 md:py-4 bg-gray-100 border-0 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 text-sm md:text-base ${
            error ? 'ring-2 ring-red-500' : ''
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          placeholder={placeholder}
        />
        <HiLocationMarker className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {/* 드롭다운 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-center text-gray-500">
              <div className="w-5 h-5 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-2"></div>
              Searching...
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150"
              >
                <div className="flex items-start space-x-3">
                  <HiLocationMarker className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{suggestion.text}</p>
                    <p className="text-xs text-gray-500 truncate">{suggestion.place_name}</p>
                  </div>
                </div>
              </button>
            ))
          ) : inputValue.trim().length >= 2 ? (
            <div className="px-4 py-3 text-center text-gray-500 text-sm">No locations found</div>
          ) : null}
        </div>
      )}

      {error && <p className="mt-1 mr-10 text-sm text-red-500">{error}</p>}
    </div>
  );
}
