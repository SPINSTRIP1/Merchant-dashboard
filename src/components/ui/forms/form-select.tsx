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
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "../label";

type OptionType = string | { label: string; value: string };

interface FormSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  options?: OptionType[];
  category?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  options,
  category,
  disabled,
  className,
  onChange,
}: FormSelectProps<TFieldValues>) {
  const normalizeOption = (option: OptionType) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }
    return option;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <Label>{label}</Label>
          <Select
            value={field.value}
            onValueChange={(value) => {
              field.onChange(value);
              onChange?.(value);
            }}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger
                className={cn(
                  "w-full !rounded-2xl border bg-[#F3F3F3] border-neutral-accent !h-[49px]",
                  className
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>{category || label}</SelectLabel>
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
