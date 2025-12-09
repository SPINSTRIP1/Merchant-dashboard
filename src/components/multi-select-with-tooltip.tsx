import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function MultiSelectWithTooltip({
  options,
  onValueChange,
  value,
  className,
  radioClassName,
}: {
  options?: { label: string; value: string; description?: string }[];
  onValueChange: (value: string) => void;
  value: string;
  className?: string;
  radioClassName?: string;
}) {
  return (
    <TooltipProvider>
      <RadioGroup
        value={value}
        onValueChange={onValueChange}
        className={cn("grid grid-cols-2 lg:flex flex-wrap gap-x-4", className)}
      >
        {options?.map((option, index) => (
          <Tooltip key={index} delayDuration={200}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "flex bg-[#E0E0E0] w-full lg:w-[170px] h-[44px] px-3 rounded-full items-center gap-x-2 cursor-pointer",
                  radioClassName
                )}
              >
                <RadioGroupItem value={option.value} id={`r${index}`} />
                <label
                  htmlFor={`r${index}`}
                  className="text-sm text-secondary-text cursor-pointer flex-1"
                >
                  {option.label}
                </label>
              </div>
            </TooltipTrigger>
            {option.description && (
              <TooltipContent
                side="bottom"
                className="max-w-[280px] shadow-md bg-white"
              >
                <p className="text-sm">{option.description}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </RadioGroup>
    </TooltipProvider>
  );
}
