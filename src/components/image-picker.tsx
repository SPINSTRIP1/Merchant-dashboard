"use client";

import { useRef, useState, type DragEvent } from "react";
import { ArrowLeftToLine, ImagePlus, Loader2, X } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export interface ImagePickerProps {
  /** New images picked on this device, in display order. The first image overall is the cover. */
  value: File[];
  onChange: (files: File[]) => void;
  /** Images already uploaded (URLs). They show first. */
  existing?: string[];
  /** Remove an uploaded image. Leave it out to hide the remove button on uploaded images. */
  onRemoveExisting?: (index: number) => void | Promise<void>;
  /** Most images allowed, uploaded + new. */
  max?: number;
  maxSizeInMB?: number;
  error?: string;
  className?: string;
}

// One preview URL per File for the page's lifetime, so a step that unmounts and remounts (or
// StrictMode's double mount) shows the same image without re-reading the file.
const previewUrls = new WeakMap<File, string>();

function previewUrl(file: File) {
  let url = previewUrls.get(file);
  if (!url) {
    url = URL.createObjectURL(file);
    previewUrls.set(file, url);
  }
  return url;
}

/**
 * Pick several images at once: tap to browse (multi-select) or drop files anywhere on the grid.
 * Fully controlled, so what's shown always matches the form — leaving a step and coming back keeps
 * every image. The first image is the cover; "Make cover" moves a new image to the front.
 */
export default function ImagePicker({
  value,
  onChange,
  existing = [],
  onRemoveExisting,
  max = 6,
  maxSizeInMB = 10,
  error,
  className,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState<number | null>(null);

  const total = existing.length + value.length;
  const room = Math.max(0, max - total);
  const single = max === 1;

  const addFiles = (list: FileList | File[]) => {
    const picked = Array.from(list);
    const problems: string[] = [];
    const valid = picked.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        problems.push(`${file.name} isn't a JPG, PNG, WEBP or SVG image.`);
        return false;
      }
      if (file.size > maxSizeInMB * 1024 * 1024) {
        problems.push(`${file.name} is over ${maxSizeInMB}MB.`);
        return false;
      }
      return true;
    });
    // A single picker swaps the image; otherwise keep what fits.
    const accepted = single ? valid.slice(0, 1) : valid.slice(0, room);
    if (!single && valid.length > room) problems.push(`Only ${max} images allowed, so ${valid.length - room} were skipped.`);
    problems.forEach((message) => toast.error(message));
    if (accepted.length) onChange(single ? accepted : [...value, ...accepted]);
  };

  const removeFile = (index: number) => onChange(value.filter((_, i) => i !== index));

  const makeCover = (index: number) => onChange([value[index], ...value.filter((_, i) => i !== index)]);

  const removeExisting = async (index: number) => {
    if (!onRemoveExisting) return;
    setRemoving(index);
    try {
      await onRemoveExisting(index);
    } finally {
      setRemoving(null);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  };

  const tiles = [
    ...existing.map((src, index) => ({ key: `url-${src}`, src, kind: "existing" as const, index })),
    ...value.map((file, index) => ({ key: `file-${index}-${file.name}-${file.size}`, src: previewUrl(file), kind: "new" as const, index, name: file.name })),
  ];
  const canAdd = single || room > 0;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "grid gap-3 rounded-2xl transition-colors",
          single ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3",
          dragging && "bg-primary/5 ring-2 ring-primary/40 ring-offset-2 ring-offset-background",
        )}
      >
        {tiles.map((tile, position) => (
          <div
            key={tile.key}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-muted",
              single ? "aspect-[16/9]" : "aspect-square",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={tile.src} alt={position === 0 ? "Cover image" : `Image ${position + 1}`} className="h-full w-full object-cover" />
            {position === 0 && !single && (
              <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-[10px] font-semibold text-white">
                Cover
              </span>
            )}
            {(tile.kind === "new" || onRemoveExisting) && (
              <button
                type="button"
                onClick={() => (tile.kind === "new" ? removeFile(tile.index) : removeExisting(tile.index))}
                disabled={removing === tile.index && tile.kind === "existing"}
                aria-label="Remove image"
                className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/65 text-white transition-colors hover:bg-black/85"
              >
                {removing === tile.index && tile.kind === "existing" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            )}
            {tile.kind === "new" && position > 0 && existing.length === 0 && (
              <button
                type="button"
                onClick={() => makeCover(tile.index)}
                className="absolute inset-x-2 bottom-2 flex h-8 items-center justify-center gap-1 rounded-full bg-black/65 text-[11px] font-semibold text-white transition-colors hover:bg-black/85"
              >
                <ArrowLeftToLine className="h-3.5 w-3.5" /> Make cover
              </button>
            )}
          </div>
        ))}

        {canAdd && !(single && tiles.length) && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed bg-muted/40 px-3 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
              single ? "aspect-[16/9]" : "aspect-square",
              error && "border-destructive/60",
            )}
          >
            <ImagePlus className="h-7 w-7 text-muted-foreground" />
            <span className="text-sm font-semibold text-foreground">
              {tiles.length ? "Add more" : single ? "Add image" : "Add images"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {single ? "Tap to browse or drop it here" : "Tap to pick several, or drop them here"}
            </span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple={!single}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) addFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
        <span>JPG, PNG, WEBP or SVG · up to {maxSizeInMB}MB each</span>
        {single ? (
          tiles.length > 0 && (
            <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-primary hover:underline">
              Replace image
            </button>
          )
        ) : (
          <span>
            {total} of {max} images
          </span>
        )}
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
