import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { useId } from "react";

export function MultiSelect({
  options,
  onValueChange,
  value,
  className,
  radioClassName,
}: {
  options?: { label: string; value: string }[];
  onValueChange: (value: string) => void;
  value: string;
  className?: string;
  radioClassName?: string;
}) {
  const id = useId();
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      className={cn("grid grid-cols-2 lg:flex flex-wrap gap-x-4", className)}
    >
      {options?.map((option, index) => (
        <label
          htmlFor={`${id}-${index}`}
          className={cn(
            "flex bg-[#E0E0E0] w-full lg:w-[170px] h-[44px] px-3 rounded-full items-center gap-x-2 cursor-pointer",
            radioClassName,
          )}
          key={index}
        >
          <RadioGroupItem value={option.value} id={`${id}-${index}`} />
          <p className="text-sm text-secondary-text">{option.label}</p>
        </label>
      ))}
    </RadioGroup>
  );
}
