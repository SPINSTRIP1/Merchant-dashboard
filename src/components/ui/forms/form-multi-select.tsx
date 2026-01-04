import React from "react";
import { Control, FieldValues, Path } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface FormMultiSelectOption {
  label: string;
  value: string;
}

interface FormMultiSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  options: FormMultiSelectOption[];
  description?: string;
  disabled?: boolean;
  className?: string;
  radioClassName?: string;
  /** Set to "boolean" to convert "true"/"false" strings to actual booleans */
  valueType?: "string" | "boolean";
}

/**
 * A reusable form multi-select component integrating Shadcn UI FormField, Label, Control, Message,
 * and RadioGroup with React Hook Form.
 *
 * Used for selecting one option from a list of radio-style options.
 */
export function FormMultiSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  options,
  description,
  disabled,
  className,
  radioClassName,
  valueType = "string",
}: FormMultiSelectProps<TFieldValues>) {
  // Convert the field value to string for RadioGroup display
  const getDisplayValue = (value: unknown): string => {
    if (value === undefined || value === null) return "";
    if (typeof value === "boolean") return value.toString();
    return String(value);
  };

  // Convert the string value from RadioGroup to the appropriate type
  const parseValue = (value: string): string | boolean => {
    if (valueType === "boolean") {
      return value === "true";
    }
    return value;
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-1.5">
          <Label>{label}</Label>
          <FormControl>
            <RadioGroup
              value={getDisplayValue(field.value)}
              onValueChange={(value) => field.onChange(parseValue(value))}
              disabled={disabled}
              className={cn(
                "grid grid-cols-2 lg:flex flex-wrap gap-x-4",
                className
              )}
            >
              {options.map((option, index) => (
                <div
                  className={cn(
                    "flex bg-[#E0E0E0] w-full lg:w-[170px] h-[44px] px-3 rounded-full items-center gap-x-2",

                    radioClassName
                  )}
                  key={index}
                >
                  <RadioGroupItem
                    value={option.value}
                    id={`${String(name)}-${index}`}
                    disabled={disabled}
                  />
                  <p className={cn("text-sm text-secondary-text")}>
                    {option.label}
                  </p>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
