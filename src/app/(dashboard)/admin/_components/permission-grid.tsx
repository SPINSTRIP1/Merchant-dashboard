import { Check } from "lucide-react";
import { PERMISSIONS, type PermissionKey } from "@/lib/permissions";
import { cn } from "@/lib/utils";

/** Toggle grid of dashboard sections an admin-ops member can open. */
export default function PermissionGrid({
  value,
  onChange,
}: {
  value: PermissionKey[];
  onChange: (value: PermissionKey[]) => void;
}) {
  const toggle = (key: PermissionKey) =>
    onChange(value.includes(key) ? value.filter((k) => k !== key) : [...value, key]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold text-foreground">Dashboard permissions</p>
        <button
          type="button"
          onClick={() =>
            onChange(value.length === PERMISSIONS.length ? [] : PERMISSIONS.map((p) => p.key))
          }
          className="text-[11px] font-semibold text-primary hover:underline"
        >
          {value.length === PERMISSIONS.length ? "Clear all" : "Select all"}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PERMISSIONS.map(({ key, label }) => {
          const selected = value.includes(key);
          return (
            <button
              key={key}
              type="button"
              role="checkbox"
              aria-checked={selected}
              onClick={() => toggle(key)}
              className={cn(
                "flex min-h-[40px] items-center gap-2 rounded-xl border px-3 text-left text-xs font-semibold transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "grid h-4 w-4 shrink-0 place-items-center rounded-[5px] border",
                  selected ? "border-primary bg-primary text-white" : "border-neutral-accent"
                )}
              >
                {selected && <Check className="h-3 w-3" />}
              </span>
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
