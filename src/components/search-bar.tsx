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
        "relative flex h-11 w-full min-w-[200px] max-w-[220px] flex-shrink-0 items-center md:max-w-[340px]",
        className
      )}
    >
      <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" />
      <input
        placeholder={placeholder || "Search anything"}
        className="h-full w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
