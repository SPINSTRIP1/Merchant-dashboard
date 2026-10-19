"use client";

import { SHOW_SAMPLE_FEATURES } from "@/lib/features";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppSelector } from "@/hooks/redux";
import { selectUser } from "@/store/selectors";
import { useChangePassword } from "@/hooks/use-settings-extras";

const FIELDS = [
  { key: "current", label: "Current password", autoComplete: "current-password" },
  { key: "next", label: "New password", autoComplete: "new-password" },
  { key: "confirm", label: "Confirm new password", autoComplete: "new-password" },
] as const;

type FormState = Record<(typeof FIELDS)[number]["key"], string>;

export default function SecurityPage() {
  const user = useAppSelector(selectUser);
  const { changePassword, isPending } = useChangePassword();
  const [form, setForm] = useState<FormState>({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.next !== form.confirm) {
      toast.error("New passwords don't match");
      return;
    }
    if (await changePassword({ current: form.current, next: form.next })) {
      setForm({ current: "", next: "", confirm: "" });
    }
  };

  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Security" />
      <PageHeader title="Security" subtitle="Keep your account and payouts protected." />
      <div
        className={
          SHOW_SAMPLE_FEATURES ? "grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]" : "grid max-w-xl grid-cols-1 gap-4"
        }
      >
        {/* Change password is simulated until the API supports it. */}
        {SHOW_SAMPLE_FEATURES && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-6"
        >
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-display text-lg font-bold text-foreground">Change password</h3>
            <SampleDataBadge label="Sample" />
          </div>
          {user?.email && <p className="mt-1 text-sm text-muted-foreground">Signed in as {user.email}</p>}
          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            {FIELDS.map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={`pw-${field.key}`}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={`pw-${field.key}`}
                    type={show ? "text" : "password"}
                    required
                    autoComplete={field.autoComplete}
                    value={form[field.key]}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    className="pr-11"
                  />
                  {field.key === "current" && (
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? "Hide passwords" : "Show passwords"}
                      className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
                    >
                      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <Button type="submit" variant="brand" size="lg" className="w-full" disabled={isPending}>
              {isPending ? "Updating…" : "Change Password"}
            </Button>
          </form>
        </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-2xl border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <KeyRound className="h-4 w-4 text-primary" /> Forgot your password?
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Reset it with a one-time code sent to your email.
            </p>
            <Link href="/forgot-password" className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
              Reset with OTP
            </Link>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Good practice
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-muted-foreground">
              <li>Use at least 8 characters with a mix of letters, numbers and symbols.</li>
              <li>Don&apos;t reuse your SpinStrip password elsewhere.</li>
              <li>Give staff their own accounts from Admin &amp; Roles instead of sharing yours.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
