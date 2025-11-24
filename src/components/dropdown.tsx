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
}: {
  header?: string;
  placeholder: string;
  options: string[];
  className?: string;
}) {
  return (
    <div
      className={`flex ${header ? "mb-3" : ""} justify-between items-center`}
    >
      {header && (
        <h2 className="font-bold text-primary-text text-sm">{header}</h2>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div className="flex items-center border p-1 rounded-lg">
            <p className="text-sm">{placeholder}</p>
            <ChevronDown
              className="inline-block text-secondary-text ml-1"
              size={18}
            />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={cn("w-48", className)}>
          {options.map((option) => (
            <DropdownMenuItem key={option}>{option}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
