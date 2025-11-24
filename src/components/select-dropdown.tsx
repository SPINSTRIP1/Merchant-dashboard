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

type OptionType = string | { label: string; value: string };

interface SelectDropdownProps {
  className?: string;
  placeholder?: string;
  options?: OptionType[];
  category?: string;
  value: string;
  onValueChange?: (value: string) => void;
}

export default function SelectDropdown({
  className,
  placeholder,
  options,
  category,
  value,
  onValueChange,
}: SelectDropdownProps) {
  const normalizeOption = (option: OptionType) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }
    return option;
  };

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn("w-full bg-[#F3F3F3] !h-[49px] outline-none", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>{category || "Select Category"}</SelectLabel>
          {options?.map((option) => {
            const normalized = normalizeOption(option);
            return (
              <SelectItem key={normalized.value} value={normalized.value}>
                {normalized.label}
              </SelectItem>
            );
          })}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
