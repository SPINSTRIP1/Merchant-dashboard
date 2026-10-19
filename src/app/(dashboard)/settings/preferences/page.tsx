"use client";

import { SHOW_SAMPLE_FEATURES } from "@/lib/features";
import { motion } from "framer-motion";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import SampleDataBadge from "@/components/sample-data-badge";
import { Switch } from "@/components/ui/switch";
import { useAppSelector } from "@/hooks/redux";
import { selectUser } from "@/store/selectors";
import { usePreferences, type MerchantPreferences } from "@/hooks/use-settings-extras";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 max-w-2xl rounded-2xl border bg-card p-6"
    >
      <h3 className="font-display text-lg font-bold text-foreground">Appearance</h3>
      <p className="text-xs text-muted-foreground">Switch the dashboard between light and dark themes.</p>
      <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Theme">
        {THEMES.map(({ value, label, icon: Icon }) => {
          const selected = mounted && theme === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setTheme(value)}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-xl border text-xs font-semibold transition-colors",
                selected ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" /> {label}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

const ROWS: { key: keyof MerchantPreferences; label: string; hint: string }[] = [
  { key: "emailNotifications", label: "Email notifications", hint: "Settlements, new orders and bookings" },
  { key: "pushNotifications", label: "Push notifications", hint: "Real-time order and seating alerts" },
  { key: "weeklySummary", label: "Weekly summary", hint: "A Monday email with last week's revenue and customers" },
  {
    key: "autoSettlement",
    label: "Auto-settlement (T+1)",
    hint: "Automatically settle cleared transactions the next business day",
  },
];

export default function PreferencesPage() {
  const user = useAppSelector(selectUser);
  const { preferences, setPreference } = usePreferences(user?.email ?? "me");

  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Preferences" />
      <PageHeader title="Preferences" subtitle="Choose how SpinStrip keeps you updated and settles your money." />
      <AppearanceCard />
      {SHOW_SAMPLE_FEATURES && (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl rounded-2xl border bg-card p-6"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-foreground">Notifications & payouts</h3>
          <SampleDataBadge label="Saved on this device" />
        </div>
        <ul className="mt-2 divide-y">
          {ROWS.map((row) => (
            <li key={row.key} className="flex items-center justify-between gap-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">{row.label}</p>
                <p className="text-xs text-muted-foreground">{row.hint}</p>
              </div>
              <Switch
                checked={preferences[row.key]}
                onCheckedChange={(value) => setPreference(row.key, value)}
                aria-label={row.label}
              />
            </li>
          ))}
        </ul>
      </motion.div>
      )}
    </div>
  );
}
