"use client";

import { useState, useEffect, useRef } from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api/axios-client";
import { cn } from "@/lib/utils";
import { Loader2Icon, MapPinIcon } from "lucide-react";
import { SERVER_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../places/_hooks/use-debounce";
import { SinglePlace } from "../../places/_components/claim-places-steps/find-place";

interface PlaceAutocompleteProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  onSelect?: (place: SinglePlace) => void;
}

// Fetch function for place suggestions
const fetchPlaceSuggestions = async (
  searchQuery: string
): Promise<SinglePlace[]> => {
  const response = await api.get<{ data: { data: SinglePlace[] } }>(
    SERVER_URL + `/places/public`,
    {
      params: { search: searchQuery },
    }
  );
  console.log(response.data.data.data);
  return response.data.data.data || [];
};

export function PlaceAutocomplete<T extends FieldValues>({
  control,
  name,
  label = "Add a place",
  placeholder = "Search for a place",
  onSelect,
}: PlaceAutocompleteProps<T>) {
  const [query, setQuery] = useState("");
  const [displayValue, setDisplayValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hasSelected, setHasSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
  });

  // TanStack Query for place suggestions
  const {
    data: suggestions = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["place-suggestions", debouncedQuery],
    queryFn: () => fetchPlaceSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 2 && !hasSelected,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setDisplayValue(value);
    setSelectedIndex(-1);
    setHasSelected(false); // Reset selection flag when user types

    // Clear the field value when typing (only set it on selection)
    if (field.value) {
      field.onChange("");
    }

    if (value.length < 2) {
      setIsOpen(false);
      return;
    }
    if (suggestions.length > 0) setIsOpen(true);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (place: SinglePlace) => {
    setHasSelected(true); // Mark as selected to prevent refetch
    field.onChange(place.id); // Set the place ID in the form
    setDisplayValue(place.name); // Show the place name in the input
    setQuery(""); // Clear search query
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onSelect) {
      onSelect(place);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open dropdown when suggestions are available and query is valid
  useEffect(() => {
    if (suggestions.length > 0 && debouncedQuery.length >= 2 && !hasSelected) {
      setIsOpen(true);
    }
  }, [suggestions, debouncedQuery, hasSelected]);

  const showLoading = isLoading || isFetching;

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={name}
          value={displayValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0 && query.length >= 2) setIsOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            "pr-10 !rounded-2xl border border-neutral-accent",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          autoComplete="off"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {showLoading ? (
            <Loader2Icon className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <MapPinIcon className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm font-medium text-destructive">{error.message}</p>
      )}

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {suggestions.map((place, index) => (
            <li
              key={place.id}
              onClick={() => handleSelectSuggestion(place)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors",
                index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50",
                index !== suggestions.length - 1 && "border-b border-gray-100"
              )}
            >
              <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {place.name}
                </span>
                {place.address && (
                  <span className="text-xs text-gray-500 truncate">
                    {place.address}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen &&
        query.length >= 2 &&
        !showLoading &&
        suggestions.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <p className="text-sm text-gray-500 text-center">No places found</p>
          </div>
        )}
    </div>
  );
}
