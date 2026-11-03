"use client";

import { Control, FieldValues, Path, useController } from "react-hook-form";
import ImagePicker from "@/components/image-picker";
import { Label } from "@/components/ui/label";

interface FormUploadImageProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  className?: string;
  maxSizeInMB?: number;
  description?: string;
}

/** One image for a react-hook-form field. The value is a picked `File`, an uploaded URL, or null. */
export function FormUploadImage<T extends FieldValues>({
  control,
  name,
  label,
  className,
  maxSizeInMB = 10,
  description,
}: FormUploadImageProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const value = field.value as File | string | null | undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && <Label>{label}</Label>}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <ImagePicker
        max={1}
        value={value instanceof File ? [value] : []}
        existing={typeof value === "string" && value ? [value] : []}
        onChange={(files) => field.onChange(files[0] ?? null)}
        onRemoveExisting={() => field.onChange(null)}
        maxSizeInMB={maxSizeInMB}
        error={error?.message}
        className={className}
      />
    </div>
  );
}
