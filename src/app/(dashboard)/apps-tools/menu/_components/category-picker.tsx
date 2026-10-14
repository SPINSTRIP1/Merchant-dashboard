"use client";

import { useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { categoryLabel, useMenuCategories } from "@/hooks/use-menu";
import { cn } from "@/lib/utils";

/** Category pills (built-in + ones already used on the menu) with an inline "Add Category". */
export default function CategoryPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { categories } = useMenuCategories();
  const [added, setAdded] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const all = [...new Set([...categories, ...added, ...(value ? [value] : [])])];

  const commit = () => {
    const name = draft.trim();
    if (!name) return;
    const existing = all.find((c) => categoryLabel(c).toLowerCase() === name.toLowerCase());
    const next = existing ?? name;
    if (!existing) setAdded((prev) => [...prev, name]);
    onChange(next);
    setDraft("");
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {all.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          aria-pressed={value === category}
          className={cn(
            "min-h-[36px] rounded-full border px-4 text-xs font-semibold transition-colors",
            value === category
              ? "brand-gradient border-transparent text-white shadow-md shadow-primary/25"
              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
          )}
        >
          {categoryLabel(category)}
        </button>
      ))}

      {adding ? (
        <span className="flex items-center gap-1 rounded-full border border-primary/40 bg-card pl-3 pr-1">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              } else if (e.key === "Escape") {
                setAdding(false);
              }
            }}
            placeholder="Category name"
            className="h-8 w-32 bg-transparent text-xs outline-none"
          />
          <button
            type="button"
            onClick={commit}
            aria-label="Add category"
            className="grid h-7 w-7 place-items-center rounded-full text-primary hover:bg-primary/10"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setAdding(false)}
            aria-label="Cancel"
            className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-dashed border-primary/40 px-3.5 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <Plus className="h-3.5 w-3.5" /> Add Category
        </button>
      )}
    </div>
  );
}
