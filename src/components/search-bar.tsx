import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import React from "react";

export default function SearchBar({
  placeholder,
  className,
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div
      className={cn(
        "bg-[#E0E0E0] h-[35px] border border-[#C8C8C8] flex-shrink-0 w-full flex items-center gap-x-1.5 px-1 rounded-3xl max-w-[260px] md:max-w-[370px]",
        className
      )}
    >
      <Search className="text-[#6F6D6D]" strokeWidth={1.2} />
      <input
        placeholder={placeholder || "Search anything"}
        className="bg-transparent outline-none placeholder:text-secondary-text text-base h-auto w-full"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
