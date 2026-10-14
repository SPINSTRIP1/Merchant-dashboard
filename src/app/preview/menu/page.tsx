"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Flame, Minus, Plus, Search, ShoppingBag, UtensilsCrossed } from "lucide-react";
import Loader from "@/components/loader";
import SampleDataBadge from "@/components/sample-data-badge";
import { usePublicMenu, type PublicMenuItem } from "@/hooks/use-menu";
import { useTableByToken } from "@/hooks/use-menu-tables";
import { cn } from "@/lib/utils";
import { formatNaira } from "@/utils";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function AddButton({ onClick, size = "md" }: { onClick: () => void; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add to order"
      className={cn(
        "brand-gradient grid shrink-0 place-items-center rounded-full text-white transition-transform active:scale-90",
        size === "sm" ? "h-8 w-8" : "h-9 w-9"
      )}
    >
      <Plus className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} />
    </button>
  );
}

function DishImage({ item }: { item: PublicMenuItem }) {
  return item.image ? <Image src={item.image} alt="" fill className="object-cover" /> : null;
}

function PublicMenu() {
  const params = useSearchParams();
  const tableToken = params.get("table");
  const { table } = useTableByToken(tableToken);
  const { business, items, isSample, isLoading } = usePublicMenu();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({});

  const categories = useMemo(() => ["All", ...new Set(items.map((i) => i.category))], [items]);
  const popular = items.filter((i) => i.bestSeller);
  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(
      (i) => (category === "All" || i.category === category) && (!query || i.name.toLowerCase().includes(query))
    );
  }, [items, category, search]);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = items.reduce((sum, i) => sum + (cart[i.id] ?? 0) * i.price, 0);
  const add = (id: string) => setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));
  const remove = (id: string) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });

  if (isLoading) return <Loader />;

  const initials = initialsOf(business);
  const tableLabel = table?.label ?? (tableToken ? "your table" : null);
  const minPrice = items.length ? Math.min(...items.map((i) => i.price)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary text-[10px] font-extrabold text-white">
              {initials}
            </span>
            {business}
          </span>
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-muted" aria-label={`${cartCount} items in order`}>
            <ShoppingBag className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </span>
        </div>
      </header>

      <div className="brand-gradient h-44 md:h-56" />

      <main className="mx-auto max-w-3xl px-4 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="-mt-14 flex items-center justify-between gap-4 rounded-2xl bg-card p-5 shadow-xl shadow-primary/10"
        >
          <div className="flex min-w-0 items-center gap-4">
            <div className="brand-gradient grid h-14 w-14 shrink-0 place-items-center rounded-2xl font-display text-lg font-extrabold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-xl font-extrabold">{business}</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {tableLabel && (
                  <span className="font-semibold text-primary">Ordering from {tableLabel} · </span>
                )}
                {items.length} dishes{items.length ? ` · from ${formatNaira(minPrice)}` : ""}
              </p>
            </div>
          </div>
          <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="hidden h-[30px] w-[76px] sm:block" />
        </motion.div>

        {isSample && (
          <div className="mt-3 flex justify-center">
            <SampleDataBadge label="Sample menu" />
          </div>
        )}

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search the ${business} menu…`}
            className="h-12 w-full rounded-2xl border bg-card pl-11 pr-4 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {popular.length > 0 && (
          <section className="mt-6">
            <h2 className="mb-3 flex items-center gap-1.5 font-display text-base font-bold">
              <Flame className="h-4 w-4 text-primary" /> Popular here
            </h2>
            <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
              {popular.map((item) => (
                <div key={item.id} className="flex w-64 shrink-0 items-center gap-3 rounded-2xl border bg-card p-3">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-primary/10 text-primary">
                    <Flame className="h-5 w-5" />
                    <DishImage item={item} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white">
                      🔥 {item.tag || "Best Seller"}
                    </span>
                    <p className="mt-1 truncate text-sm font-semibold">{item.name}</p>
                    <p className="text-sm font-bold text-primary">{formatNaira(item.price)}</p>
                  </div>
                  <AddButton onClick={() => add(item.id)} />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={cn(
                "min-h-[40px] shrink-0 rounded-full px-5 text-sm font-semibold transition-all",
                category === c ? "brand-gradient text-white shadow-md" : "border bg-card text-muted-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 flex flex-col items-center gap-2 text-center">
            <UtensilsCrossed className="h-7 w-7 text-muted-foreground/60" />
            <p className="text-sm font-semibold">No dishes found</p>
            <p className="text-xs text-muted-foreground">Try another search or category.</p>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className="relative h-36 bg-gradient-to-br from-primary/15 to-fuchsia-200/40">
                  <DishImage item={item} />
                  {item.tag && (
                    <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary shadow">
                      {item.bestSeller ? "🔥 " : "✨ "}
                      {item.tag}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-900 shadow">
                    {formatNaira(item.price)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{item.description}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground/80">
                      {item.category} · {item.availability}
                    </p>
                  </div>
                  {(cart[item.id] ?? 0) > 0 ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => remove(item.id)}
                        aria-label="Remove one"
                        className="grid h-8 w-8 place-items-center rounded-full bg-muted transition-transform active:scale-90"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{cart[item.id]}</span>
                      <AddButton size="sm" onClick={() => add(item.id)} />
                    </div>
                  ) : (
                    <AddButton onClick={() => add(item.id)} />
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Serving times are shown per dish. Prices are confirmed by the restaurant when you pay.
        </p>
      </main>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 90 }}
            animate={{ y: 0 }}
            exit={{ y: 90 }}
            className="fixed inset-x-0 bottom-4 z-30 mx-auto w-[calc(100%-2rem)] max-w-xl"
          >
            <button
              type="button"
              onClick={() =>
                toast.success(
                  `Order sent${tableLabel ? ` to ${tableLabel}` : ""} — pay at the counter or with SpinStrip Wallet`
                )
              }
              className="brand-gradient flex h-14 w-full items-center justify-between rounded-full px-6 text-sm font-semibold text-white shadow-2xl shadow-primary/40"
            >
              <span className="inline-flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> {cartCount} item{cartCount === 1 ? "" : "s"}
              </span>
              <span>Place order · {formatNaira(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PublicMenuPage() {
  return (
    <Suspense fallback={<Loader />}>
      <PublicMenu />
    </Suspense>
  );
}
