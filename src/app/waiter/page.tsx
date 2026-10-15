"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConciergeBell, LayoutDashboard, LogOut, Minus, Plus, Search, Users, UtensilsCrossed } from "lucide-react";
import toast from "react-hot-toast";
import ThemeToggle from "@/components/theme-toggle";
import SampleDataBadge from "@/components/sample-data-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { usePermissions } from "@/hooks/use-permissions";
import { usePublicMenu } from "@/hooks/use-menu";
import { useSeatGuests, useWaiterFloor, type FloorTable } from "@/hooks/use-menu-tables";
import { cn } from "@/lib/utils";
import { formatNaira, timeAgo } from "@/utils";

type Tab = "tables" | "menu";

export default function WaiterApp() {
  const { user, logout } = useReduxAuth();
  const { role } = usePermissions();
  const { tables, isLoading } = useWaiterFloor();
  const { items: menuItems, isSample: isSampleMenu, isLoading: isMenuLoading } = usePublicMenu();
  const seatGuests = useSeatGuests();

  const [tab, setTab] = useState<Tab>("tables");
  const [seating, setSeating] = useState<FloorTable | null>(null);
  const [guests, setGuests] = useState(2);
  const [menuQuery, setMenuQuery] = useState("");

  const firstName = (user?.fullName ?? "").split(" ")[0] || "there";
  const seatedToday = tables.reduce((sum, t) => sum + t.guestsToday, 0);
  const openOrders = tables.reduce((sum, t) => sum + t.openOrders, 0);
  const occupied = tables.filter((t) => t.occupied).length;

  const menuByCategory = useMemo(() => {
    const q = menuQuery.trim().toLowerCase();
    const groups = new Map<string, typeof menuItems>();
    menuItems
      .filter((m) => !q || `${m.name} ${m.category}`.toLowerCase().includes(q))
      .forEach((m) => groups.set(m.category, [...(groups.get(m.category) ?? []), m]));
    return [...groups.entries()];
  }, [menuItems, menuQuery]);

  const openSeating = (table: FloorTable) => {
    setSeating(table);
    setGuests(Math.min(2, table.seats));
  };

  const confirmSeating = () => {
    if (!seating) return;
    seatGuests.mutate(
      { tableId: seating.id, guests },
      {
        onSuccess: () => {
          toast.success(`Seated ${guests} guest${guests === 1 ? "" : "s"} at ${seating.label}`);
          setSeating(null);
        },
      }
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-lg bg-background pb-24 text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-lg">
        <div className="flex h-16 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
          <Image src="/logo.svg" alt="SpinStrip" width={76} height={30} className="h-[30px] w-[76px]" />
          <div className="flex items-center gap-1">
            <ThemeToggle className="h-10 w-10 rounded-full" />
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600">
              <ConciergeBell className="h-3 w-3" /> Waiter · {firstName}
            </span>
            {role !== "waiter" && (
              <Link
                href="/"
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
                aria-label="Back to dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
              </Link>
            )}
            <button
              type="button"
              onClick={logout}
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-muted"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="p-4">
        {tab === "tables" ? (
          <>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h1 className="font-display text-xl font-bold">Floor Plan</h1>
              <SampleDataBadge label="Sample" />
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Tap a table to seat guests. Updates live every 15s.</p>

            <div className="mb-4 grid grid-cols-3 gap-2">
              {[
                { label: "Guests today", value: seatedToday },
                { label: "Occupied", value: `${occupied}/${tables.length}` },
                { label: "Open orders", value: openOrders },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border bg-card px-3 py-2.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
                  <p className="font-display text-lg font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-28 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {tables.map((t, i) => (
                  <motion.button
                    key={t.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => openSeating(t)}
                    className={cn(
                      "rounded-2xl border bg-card p-4 text-left transition-transform active:scale-95",
                      t.occupied && "border-primary/40 bg-primary/5",
                      t.openOrders > 0 && "border-amber-500/50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-display font-bold">{t.label}</p>
                      <span
                        className={cn(
                          "h-2.5 w-2.5 rounded-full",
                          t.occupied ? "bg-primary" : "bg-emerald-500"
                        )}
                        aria-label={t.occupied ? "Occupied" : "Free"}
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {t.seats} seats · {t.occupied ? "Occupied" : "Free"}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-1 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" /> {t.guestsToday} today
                      </span>
                      {t.openOrders > 0 && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-bold text-amber-600">
                          {t.openOrders} open
                        </span>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h1 className="font-display text-xl font-bold">Menu</h1>
              {isSampleMenu && <SampleDataBadge label="Sample" />}
            </div>
            <p className="mb-4 text-xs text-muted-foreground">Available dishes to guide guests.</p>
            <label className="mb-4 flex items-center gap-2 rounded-full border bg-card px-4">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={menuQuery}
                onChange={(e) => setMenuQuery(e.target.value)}
                placeholder="Search dishes"
                aria-label="Search dishes"
                className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </label>
            {isMenuLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            ) : menuByCategory.length === 0 ? (
              <p className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                No dishes found.
              </p>
            ) : (
              menuByCategory.map(([category, dishes]) => (
                <section key={category} className="mb-5">
                  <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{category}</h2>
                  <ul className="space-y-2">
                    {dishes.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {m.name}
                            {m.bestSeller && (
                              <span className="ml-2 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase text-primary">
                                Best seller
                              </span>
                            )}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">{m.availability}</p>
                        </div>
                        <span className="shrink-0 font-display text-sm font-bold text-primary">{formatNaira(m.price)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))
            )}
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto max-w-lg border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg">
        <div className="grid grid-cols-2">
          {(["tables", "menu"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-current={tab === t ? "page" : undefined}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-semibold",
                tab === t ? "text-primary" : "text-muted-foreground"
              )}
            >
              {t === "tables" ? <ConciergeBell className="h-5 w-5" /> : <UtensilsCrossed className="h-5 w-5" />}
              {t === "tables" ? "Tables" : "Menu"}
            </button>
          ))}
        </div>
      </nav>

      <Dialog open={!!seating} onOpenChange={(open) => !open && setSeating(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogTitle className="font-display">Seat guests — {seating?.label}</DialogTitle>
          <DialogDescription>
            {seating?.seats} seats
            {seating?.lastSeatedAt ? ` · last seated ${timeAgo(seating.lastSeatedAt)}` : ""}
          </DialogDescription>
          <div className="flex items-center justify-center gap-6 py-4">
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              className="grid h-14 w-14 place-items-center rounded-full border active:scale-95"
              aria-label="Fewer guests"
            >
              <Minus className="h-5 w-5" />
            </button>
            <span className="w-16 text-center font-display text-5xl font-extrabold text-primary" aria-live="polite">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(40, g + 1))}
              className="grid h-14 w-14 place-items-center rounded-full border active:scale-95"
              aria-label="More guests"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
          {seating && guests > seating.seats && (
            <p className="-mt-2 text-center text-xs text-amber-600">More guests than seats — add chairs if needed.</p>
          )}
          <button
            type="button"
            onClick={confirmSeating}
            disabled={seatGuests.isPending}
            className="brand-gradient h-12 w-full rounded-full text-sm font-semibold text-white disabled:opacity-60"
          >
            {seatGuests.isPending ? "Seating…" : `Seat ${guests} guest${guests === 1 ? "" : "s"}`}
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
