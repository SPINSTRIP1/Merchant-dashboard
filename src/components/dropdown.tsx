import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Dropdown({
  placeholder,
  header,
  options,
  className,
  onSelect,
  value,
}: {
  header?: string;
  placeholder: string;
  options: string[];
  className?: string;
  onSelect?: (value: string) => void;
  value?: string;
}) {
  const [selectedValue, setSelectedValue] = React.useState(
    value || placeholder
  );

  React.useEffect(() => {
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = (option: string) => {
    setSelectedValue(option);
    onSelect?.(option);
  };

  return (
    <div
      className={`flex ${header ? "mb-3" : ""} justify-between items-center`}
    >
      {header && (
        <h2 className="font-bold text-primary-text text-sm">{header}</h2>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/40">
          <div className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted">
            <span>{selectedValue}</span>
            <ChevronDown className="text-muted-foreground" size={16} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className={cn("w-48 rounded-xl", className)}>
          {options.map((option) => (
            <DropdownMenuItem key={option} onClick={() => handleSelect(option)}>
              {option}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
