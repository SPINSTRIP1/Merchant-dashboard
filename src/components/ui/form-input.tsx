import React from "react";
import {
  Control,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Label } from "./label";

// Define the supported input types (excluding select)
export type FormInputType =
  | "text"
  | "date"
  | "time"
  | "textarea"
  | "number"
  | "password"
  | "default";

// Infer props type using React.ComponentPropsWithoutRef
type BaseInputProps = Omit<
  React.ComponentPropsWithoutRef<typeof Input> &
    React.ComponentPropsWithoutRef<typeof Textarea>,
  "name" | "defaultValue" | "value" | "onChange" | "onBlur" | "ref" | "type"
>;

interface FormInputProps<TFieldValues extends FieldValues>
  extends BaseInputProps {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  type?: FormInputType;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A reusable form input component integrating Shadcn UI FormField, Label, Control, Message,
 * and Input/Textarea with React Hook Form.
 *
 * Handles types: text, date, textarea, number, password. Defaults to text.
 * Does NOT handle select inputs.
 */
export function FormInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  type = "default", // Default to text
  placeholder,
  description,
  disabled,
  ...rest // Capture other valid Input/Textarea props
}: FormInputProps<TFieldValues>) {
  // Helper to render the correct input based on type

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const renderInput = (
          field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>
        ) => {
          const inputType = type === "default" ? "text" : type;

          if (inputType === "textarea") {
            return (
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                rows={6}
                {...field}
                {...rest} // Pass remaining props
                value={field.value ?? ""}
                className={cn("rounded-2xl", rest.className)}
              />
            );
          }

          return (
            <Input
              type={inputType} // Set input type (text, date, number, password)
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              {...rest}
              onChange={(e) => {
                field.onChange(handleInputChange(e, type));
              }}
              className={cn(
                "!rounded-2xl border border-neutral-accent",
                rest.className
              )}
            />
          );
        };

        return (
          <FormItem className="space-y-1.5">
            <Label>{label}</Label>
            <FormControl>{renderInput(field)}</FormControl>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function handleInputChange(
  e: React.ChangeEvent<HTMLInputElement>,
  type: FormInputType
) {
  const { value, valueAsNumber } = e.target;
  if (type === "number") {
    return isNaN(valueAsNumber) ? "" : valueAsNumber;
  }
  return value;
}
