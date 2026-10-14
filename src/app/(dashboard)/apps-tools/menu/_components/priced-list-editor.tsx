"use client";

import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface PricedItem {
  name: string;
  price: number;
}

/** Editable rows of name + price (add-ons, extras). Empty-named rows are dropped on save. */
export default function PricedListEditor({
  items,
  onChange,
  namePlaceholder,
  emptyText,
}: {
  items: PricedItem[];
  onChange: (items: PricedItem[]) => void;
  namePlaceholder: string;
  emptyText: string;
}) {
  const update = (index: number, patch: Partial<PricedItem>) =>
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  return (
    <div className="space-y-2">
      {items.length === 0 && <p className="text-xs text-muted-foreground">{emptyText}</p>}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={item.name}
            onChange={(e) => update(index, { name: e.target.value })}
            placeholder={namePlaceholder}
            className="h-11 flex-1"
          />
          <div className="relative w-32">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              ₦
            </span>
            <Input
              type="number"
              min={0}
              value={item.price || ""}
              onChange={(e) => update(index, { price: Math.max(0, Number(e.target.value) || 0) })}
              placeholder="0"
              className="h-11 pl-7"
            />
          </div>
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            aria-label="Remove"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-rose-500 transition-colors hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, { name: "", price: 0 }])}
        className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-dashed border-primary/40 px-3.5 text-xs font-semibold text-primary hover:bg-primary/5"
      >
        <Plus className="h-3.5 w-3.5" /> Add Item
      </button>
    </div>
  );
}
