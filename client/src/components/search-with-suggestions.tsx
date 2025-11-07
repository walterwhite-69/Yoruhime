import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface SearchWithSuggestionsProps {
  className?: string;
  placeholder?: string;
  testId?: string;
}

export function SearchWithSuggestions({ 
  className = "", 
  placeholder = "Search anime...",
  testId = "input-search"
}: SearchWithSuggestionsProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const { data: suggestions } = useQuery({
    queryKey: ["/api/search/suggestions", { q: searchQuery }],
    enabled: searchQuery.length > 0,
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (animeId: string, animeName: string) => {
    setSearchQuery("");
    setShowSuggestions(false);
    const cleanId = animeId.split('?')[0];
    setLocation(`/anime/${cleanId}`);
  };

  const suggestionsList = (suggestions as any)?.suggestions || [];

  return (
    <div ref={wrapperRef} className="relative">
      <form onSubmit={handleSearch}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className={className}
            data-testid={testId}
          />
        </div>
      </form>

      {showSuggestions && suggestionsList.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 md:max-h-[500px] overflow-y-auto z-50 p-2 md:p-3">
          {suggestionsList.map((suggestion: any) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion.id, suggestion.name)}
              className="w-full text-left p-2 md:p-4 hover-elevate active-elevate-2 rounded-md flex items-center gap-3 md:gap-4"
              data-testid={`suggestion-${suggestion.id}`}
            >
              <img 
                src={suggestion.poster} 
                alt={suggestion.name}
                className="w-10 h-14 md:w-16 md:h-24 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-medium truncate">{suggestion.name}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">
                  {suggestion.jname}
                </p>
              </div>
            </button>
          ))}
        </Card>
      )}
    </div>
  );
}
