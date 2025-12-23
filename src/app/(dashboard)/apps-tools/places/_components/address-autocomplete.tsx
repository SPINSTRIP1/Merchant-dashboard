"use client";

import { useState, useEffect, useRef } from "react";
import { Control, FieldValues, Path, useController } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import api from "@/lib/api/axios-client";
import { cn } from "@/lib/utils";
import { Loader2Icon, MapPinIcon } from "lucide-react";
import { PLACES_SERVER_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../_hooks/use-debounce";

interface AddressSuggestion {
  place_id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  formatted_address: string;
}

interface AddressAutocompleteProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  onSelect?: (suggestion: AddressSuggestion) => void;
}

// Fetch function for address suggestions
const fetchAddressSuggestions = async (
  searchQuery: string
): Promise<AddressSuggestion[]> => {
  const response = await api.get<{ data: AddressSuggestion[] }>(
    PLACES_SERVER_URL + `/places/google-search`,
    {
      params: { address: searchQuery },
    }
  );
  return response.data.data || [];
};

export function AddressAutocomplete<T extends FieldValues>({
  control,
  name,
  label = "Address",
  placeholder = "Enter Street Name and Number",
  onSelect,
}: AddressAutocompleteProps<T>) {
  const [query, setQuery] = useState("");
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

  // TanStack Query for address suggestions
  const {
    data: suggestions = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["address-suggestions", debouncedQuery],
    queryFn: () => fetchAddressSuggestions(debouncedQuery),
    enabled: debouncedQuery.length >= 3 && !hasSelected,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });

  // Open dropdown when suggestions are available
  //   useEffect(() => {
  //     if (suggestions.length > 0 && debouncedQuery.length >= 3 && !hasSelected) {
  //       setIsOpen(true);
  //     }
  //   }, [suggestions, debouncedQuery, hasSelected]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    field.onChange(value);
    setSelectedIndex(-1);
    setHasSelected(false); // Reset selection flag when user types

    if (value.length < 3) {
      setIsOpen(false);
      return;
    }
    if (suggestions.length > 0) setIsOpen(true);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    setHasSelected(true); // Mark as selected to prevent refetch
    field.onChange(suggestion.formatted_address);
    setQuery(suggestion.formatted_address);
    setIsOpen(false);
    setSelectedIndex(-1);

    if (onSelect) {
      onSelect(suggestion);
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

  // Sync query with field value on mount
  useEffect(() => {
    if (field.value && !query) {
      setQuery(field.value);
    }
  }, [field.value, query]);

  const showLoading = isLoading || isFetching;

  return (
    <div ref={containerRef} className="relative space-y-1.5">
      <Label htmlFor={name}>{label}</Label>
      <div className="relative">
        <Input
          ref={inputRef}
          id={name}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
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
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors",
                index === selectedIndex ? "bg-gray-100" : "hover:bg-gray-50",
                index !== suggestions.length - 1 && "border-b border-gray-100"
              )}
            >
              <MapPinIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />
              <span className="text-sm text-gray-700 truncate">
                {suggestion.formatted_address}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {isOpen &&
        query.length >= 3 &&
        !showLoading &&
        suggestions.length === 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
            <p className="text-sm text-gray-500 text-center">
              No addresses found
            </p>
          </div>
        )}
    </div>
  );
}
