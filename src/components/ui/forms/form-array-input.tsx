import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { Control, FieldValues, Path, useWatch } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface FormArrayInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "email" | "tel";
  inputClassName?: string;
  buttonClassName?: string;
}

// Store refs for all FormArrayInput instances to flush on navigation
const pendingInputRefs: Set<() => void> = new Set();

// Call this before navigation to flush all pending inputs
export function flushPendingArrayInputs() {
  pendingInputRefs.forEach((flush) => flush());
}

// Register a custom pending input flush function
export function registerPendingInput(flushFn: () => void) {
  pendingInputRefs.add(flushFn);
}

// Unregister a custom pending input flush function
export function unregisterPendingInput(flushFn: () => void) {
  pendingInputRefs.delete(flushFn);
}

export function FormArrayInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder = "Add Item",
  description,
  type = "text",
  inputClassName,
  buttonClassName,
}: FormArrayInputProps<TFieldValues>) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldRef = useRef<{
    onChange: (value: string[]) => void;
    value: string[];
  }>();

  // Register flush function for this instance
  const flushInput = useCallback(() => {
    if (inputValue.trim() && fieldRef.current) {
      const items = fieldRef.current.value || [];
      fieldRef.current.onChange([...items, inputValue.trim()]);
      setInputValue("");
    }
  }, [inputValue]);

  useEffect(() => {
    pendingInputRefs.add(flushInput);
    return () => {
      pendingInputRefs.delete(flushInput);
    };
  }, [flushInput]);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const items = (field.value as string[]) || [];

        // Keep ref updated for flush function
        fieldRef.current = { onChange: field.onChange, value: items };

        const addItem = () => {
          if (inputValue.trim()) {
            field.onChange([...items, inputValue.trim()]);
            setInputValue("");
          }
        };

        const removeItem = (index: number) => {
          const updatedList = [...items];
          updatedList.splice(index, 1);
          field.onChange(updatedList);
        };

        const handleBlur = () => {
          // Small delay to allow click on add button to register first
          setTimeout(() => {
            if (inputValue.trim()) {
              field.onChange([...items, inputValue.trim()]);
              setInputValue("");
            }
          }, 150);
        };

        return (
          <FormItem className="space-y-1.5">
            <Label>{label}</Label>
            <FormControl>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center gap-x-2">
                    <Input
                      className={`!rounded-2xl border border-neutral-accent ${inputClassName}`}
                      value={item}
                      readOnly
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className={`bg-primary-accent rounded-full p-3 ${buttonClassName}`}
                    >
                      <X size={20} className="text-primary" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-x-2">
                  <button type="button" onClick={addItem}>
                    <HugeiconsIcon
                      icon={PlusSignIcon}
                      size={24}
                      color={"#6F6D6D"}
                    />
                  </button>
                  <Input
                    ref={inputRef}
                    type={type}
                    className="rounded-none border-b bg-transparent border-neutral-accent"
                    placeholder={placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addItem();
                      }
                    }}
                  />
                </div>
              </div>
            </FormControl>
            {description && (
              <p className="text-center mt-4 text-sm text-secondary-text">
                {description}
              </p>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
