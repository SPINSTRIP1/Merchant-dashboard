import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { countries } from "@/data/countries";
import { useState } from "react";
import Image from "next/image";

export default function CountrySelectDropdown({
  className,
  placeholder = "Select Country",
  onValueChange,
}: {
  className?: string;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}) {
  const [selectedValue, setSelectedValue] = useState<string>(
    countries[0]?.name || ""
  );

  const handleValueChange = (value: string) => {
    setSelectedValue(value);
    onValueChange?.(value);
  };

  const selectedCountry = countries.find((c) => c.name === selectedValue);

  return (
    <Select onValueChange={handleValueChange} value={selectedValue}>
      <SelectTrigger className={cn("w-full !h-[49px]", className)}>
        <SelectValue placeholder={placeholder}>
          {selectedCountry && (
            <div className="flex items-center gap-3">
              <Image
                src={selectedCountry.flagUrl}
                alt={`${selectedCountry.name} flag`}
                width={24}
                height={18}
                className="h-4 w-[21px] object-cover"
              />
              <span className="font-medium">{selectedCountry.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60">
        <SelectGroup>
          <SelectLabel>Country of Incorporation</SelectLabel>
          {countries.map((country) => (
            <SelectItem
              key={country.code}
              value={country.name}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={country.flagUrl}
                  alt={`${country.name} flag`}
                  width={24}
                  height={18}
                  className="rounded-sm object-cover flex-shrink-0"
                />
                <div className="flex flex-col">
                  <span className="font-medium">{country.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {country.region} • {country.currency}
                  </span>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
