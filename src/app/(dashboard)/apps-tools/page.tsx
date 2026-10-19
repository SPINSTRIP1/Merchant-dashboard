"use client";

import SearchBar from "@/components/search-bar";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { useAppSelector } from "@/hooks/redux";
import { selectFilteredApps } from "@/store/selectors";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowUpRight, Blocks, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import toast from "react-hot-toast";

// Type for app with status
type AppWithStatus = {
  /** Stable id used for on/off state (see src/constants apps). */
  key: string;
  name: string;
  description: string;
  amount?: number;
  isActive: boolean;
  default?: boolean;
  icon: string;
  route?: string;
  publisher?: string;
};

const filters = [
  { label: "All Apps", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
  { label: "Default Apps", value: "default" },
  { label: "Community Apps", value: "community" },
];

const priceLabel = (app: AppWithStatus) => (app.amount ? `₦${app.amount.toLocaleString()}/month` : "Free");

function StatusBadge({ app }: { app: AppWithStatus }) {
  const active = app.default || app.isActive;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide",
        active ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
      )}
    >
      {app.default ? "Default" : app.isActive ? "Integrated" : "Available"}
    </span>
  );
}

export default function Apps() {
  const [selectedName, setSelectedName] = React.useState<string | null>(null);

  // Redux state and actions
  const { toggleAppState, searchQuery, updateSearchQuery, categoryFilter, updateCategoryFilter } = useReduxApps();
  const filteredApps = useAppSelector(selectFilteredApps) as AppWithStatus[];
  const selectedApp = filteredApps.find((app) => app.name === selectedName) ?? null;

  const handleToggle = (app: AppWithStatus) => {
    toggleAppState(app.key);
    if (app.isActive) toast.success(`${app.name} deactivated`);
    else toast.success(`${app.name} activated — find it in your sidebar`);
  };

  const activationControl = (app: AppWithStatus) =>
    app.default ? null : (
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        Activate
        <Switch checked={app.isActive} onCheckedChange={() => handleToggle(app)} aria-label={`Activate ${app.name}`} />
      </label>
    );

  const openLink = (app: AppWithStatus) =>
    (app.default || app.isActive) && app.route ? (
      <Link
        href={app.route}
        className="inline-flex items-center gap-0.5 text-xs font-semibold text-primary hover:underline"
      >
        Open <ArrowUpRight className="h-3.5 w-3.5" />
      </Link>
    ) : null;

  return (
    <section>
      <div className="mb-6 h-[120px] overflow-hidden rounded-2xl md:h-[161px] 2xl:h-[200px]">
        <img src="/apps-tools.png" alt="Apps Background" className="h-full w-full object-cover" />
      </div>

      <PageHeader title="Apps & Tools" subtitle="Powerful tools to supercharge your business or brand on SpinStrip." />

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search Apps"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <Select
          value={categoryFilter || "all"}
          onValueChange={(value) => updateCategoryFilter(value === "all" ? "" : value)}
        >
          <SelectTrigger className="h-11 w-[170px] rounded-full text-xs font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filters.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredApps.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredApps.map((app, i) => (
            <motion.div
              key={app.name}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="card-hover flex gap-4 rounded-2xl border bg-card p-5"
            >
              <div
                className={cn(
                  "grid h-14 w-14 shrink-0 place-items-center rounded-2xl p-1.5",
                  app.default || app.isActive ? "bg-primary/10" : "bg-muted"
                )}
              >
                <Image src={app.icon} alt="" width={56} height={56} className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold text-foreground">{app.name}</p>
                  <StatusBadge app={app} />
                </div>
                <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{app.description}</p>
                <button
                  type="button"
                  onClick={() => setSelectedName(app.name)}
                  className="mt-1 text-xs font-medium text-primary hover:underline"
                >
                  Read more
                </button>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">{priceLabel(app)}</span>
                  <div className="flex items-center gap-3">
                    {openLink(app)}
                    {activationControl(app)}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<LayoutGrid />}
            title="No apps found"
            description={
              searchQuery
                ? `Nothing matches “${searchQuery}”. Try a different app name or description.`
                : "No apps in this category."
            }
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-5 text-sm text-muted-foreground"
      >
        <Blocks className="h-5 w-5 shrink-0 text-primary" />
        More integrations are on the way — payroll, reservations and marketing automation.
      </motion.div>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedName(null)}>
        <DialogContent className="max-w-[535px]">
          {selectedApp && (
            <div className="flex gap-4">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-primary/10 p-2">
                <Image src={selectedApp.icon} alt="" width={64} height={64} className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2 pr-6">
                  <DialogTitle className="font-display text-base font-bold">{selectedApp.name}</DialogTitle>
                  <StatusBadge app={selectedApp} />
                </div>
                <DialogDescription className="text-sm text-muted-foreground">
                  {selectedApp.description}
                </DialogDescription>
                <p className="text-xs text-muted-foreground">
                  <span className="text-sm font-bold text-foreground">{priceLabel(selectedApp)}</span>
                  {" · "}Published by <span className="font-semibold">{selectedApp.publisher || "SpinStrip"}</span>
                </p>
                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  {openLink(selectedApp)}
                  {activationControl(selectedApp)}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
