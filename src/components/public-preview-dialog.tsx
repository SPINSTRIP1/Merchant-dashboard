"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Monitor, RotateCw, Smartphone, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { PUBLIC_SITE_URL } from "@/lib/public-links";
import { cn } from "@/lib/utils";

type Device = "phone" | "desktop";

const PUBLIC_ORIGIN = new URL(PUBLIC_SITE_URL).origin;

/**
 * Shows a listing's real public page (places.spinstrip.com) inside the dashboard, exactly as
 * customers see it. The page is embedded with `?merchantPreview=1`; when the listing isn't public yet
 * (draft, in review), the embedded page asks for it and this dialog sends `data` — the merchant's
 * own copy — so drafts preview the same way.
 */
export default function PublicPreviewDialog({
  open,
  onOpenChange,
  title,
  url,
  kind,
  id,
  data,
  notice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** The public page, e.g. `publicPlaceUrl(id)`. */
  url: string;
  kind: "place" | "event";
  id: string;
  /** The listing as the dashboard has it, sent if the public page can't load it. */
  data?: unknown;
  /** Shown above the preview, e.g. "Not published yet". */
  notice?: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const [reloadKey, setReloadKey] = useState(0);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Answer the embedded page's "ready" message with the dashboard's copy of the listing.
  useEffect(() => {
    if (!open) return;
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== PUBLIC_ORIGIN) return;
      const message = event.data as { type?: string; kind?: string; id?: string };
      if (message?.type !== "spinstrip:preview-ready" || message.kind !== kind || message.id !== id) return;
      if (!dataRef.current) return;
      frameRef.current?.contentWindow?.postMessage(
        { type: "spinstrip:preview-data", kind, id, data: dataRef.current },
        PUBLIC_ORIGIN
      );
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [open, kind, id]);

  const src = `${url}${url.includes("?") ? "&" : "?"}merchantPreview=1`;

  const iconButton =
    "grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[92vh] w-[96vw] max-w-[1280px] flex-col gap-0 overflow-hidden p-0 [&>button]:hidden">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate font-display text-base font-bold">{title}</DialogTitle>
            <DialogDescription className="truncate text-xs">
              Customer view · {url.replace(/^https?:\/\//, "")}
            </DialogDescription>
          </div>
          <div className="flex rounded-full border bg-card p-1" role="radiogroup" aria-label="Preview size">
            {(
              [
                { value: "phone", label: "Phone", icon: Smartphone },
                { value: "desktop", label: "Desktop", icon: Monitor },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={device === value}
                onClick={() => setDevice(value)}
                className={cn(
                  "inline-flex min-h-[32px] items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors",
                  device === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>
          <button type="button" className={iconButton} onClick={() => setReloadKey((k) => k + 1)} aria-label="Reload preview" title="Reload">
            <RotateCw className="h-4 w-4" />
          </button>
          <a href={url} target="_blank" rel="noopener" className={iconButton} aria-label="Open in a new tab" title="Open in a new tab">
            <ExternalLink className="h-4 w-4" />
          </a>
          <button type="button" className={iconButton} onClick={() => onOpenChange(false)} aria-label="Close preview">
            <X className="h-4 w-4" />
          </button>
        </div>

        {notice && (
          <p className="border-b bg-amber-500/10 px-4 py-2 text-center text-xs font-medium text-amber-700 dark:text-amber-300">
            {notice}
          </p>
        )}

        <div className="flex flex-1 justify-center overflow-hidden bg-muted/50 p-0 sm:p-4">
          <iframe
            key={reloadKey}
            ref={frameRef}
            src={src}
            title={`Customer view of ${title}`}
            className={cn(
              "h-full border-0 bg-white transition-[width] duration-300",
              device === "phone" ? "w-[390px] max-w-full rounded-[28px] border shadow-xl" : "w-full sm:rounded-2xl sm:border"
            )}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
