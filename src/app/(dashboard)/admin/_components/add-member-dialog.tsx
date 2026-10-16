"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ConciergeBell, Eye, EyeOff, UserCog } from "lucide-react";
import Field from "@/components/field";
import SampleDataBadge from "@/components/sample-data-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAdminOps, useWaiters, type TeamRole } from "@/hooks/use-team";
import type { PermissionKey } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import PermissionGrid from "./permission-grid";

const waiterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});

const adminSchema = waiterSchema.extend({
  name: z.string().trim().min(2, "Enter the team member's full name"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type WaiterValues = z.infer<typeof waiterSchema>;
type AdminValues = z.infer<typeof adminSchema>;

const ROLE_OPTIONS: { value: TeamRole; label: string; icon: typeof UserCog; help: string }[] = [
  {
    value: "waiter",
    label: "Waiter",
    icon: ConciergeBell,
    help: "Add someone who already has a SpinStrip account. They sign in to the SpinStrip waiter app with their own login to pick up orders, chat with guests and get live updates.",
  },
  {
    value: "admin_ops",
    label: "Admin Operations",
    icon: UserCog,
    help: "Admin ops sign into this dashboard. You choose exactly what they can see.",
  },
];

function WaiterForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { addWaiter } = useWaiters();
  const form = useForm<WaiterValues>({
    resolver: zodResolver(waiterSchema),
    mode: "onChange",
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      await addWaiter.mutateAsync({ email });
      toast.success(`${email} added as a waiter`);
      form.reset();
      onDone();
    } catch (error) {
      toast.error((error as Error).message || "Could not add waiter");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        label="Their SpinStrip account email"
        htmlFor="waiter-email"
        error={form.formState.errors.email?.message}
        hint="If they don't have an account yet, ask them to sign up in the SpinStrip app first."
      >
        <Input id="waiter-email" type="email" placeholder="name@example.com" {...form.register("email")} />
      </Field>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={addWaiter.isPending}>
          {addWaiter.isPending ? "Adding…" : "Add Waiter"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function AdminForm({ onDone, onCancel }: { onDone: () => void; onCancel: () => void }) {
  const { createAdmin } = useAdminOps();
  const [permissions, setPermissions] = useState<PermissionKey[]>(["overview"]);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<AdminValues>({
    resolver: zodResolver(adminSchema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    if (permissions.length === 0) {
      toast.error("Choose at least one section this admin can access");
      return;
    }
    try {
      await createAdmin.mutateAsync({ ...values, permissions });
      toast.success("Team member created");
      form.reset();
      onDone();
    } catch (error) {
      toast.error((error as Error).message || "Could not create team member");
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <SampleDataBadge label="Sample — admin ops aren't saved yet" />
      <Field label="Full name" htmlFor="member-name" error={errors.name?.message}>
        <Input id="member-name" placeholder="e.g. Adaeze Okonkwo" {...form.register("name")} />
      </Field>
      <Field label="Email" htmlFor="member-email" error={errors.email?.message}>
        <Input id="member-email" type="email" placeholder="name@business.com" {...form.register("email")} />
      </Field>
      <Field
        label="Password"
        htmlFor="member-password"
        error={errors.password?.message}
        hint="Share it with them privately — they'll use it to sign in."
      >
        <div className="relative">
          <Input
            id="member-password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className="pr-11"
            {...form.register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </Field>
      <PermissionGrid value={permissions} onChange={setPermissions} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="brand" disabled={createAdmin.isPending}>
          {createAdmin.isPending ? "Creating…" : "Create Account"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default function AddMemberDialog({
  open,
  onOpenChange,
  initialRole = "waiter",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialRole?: TeamRole;
}) {
  const [role, setRole] = useState<TeamRole>(initialRole);
  const [formKey, setFormKey] = useState(0);

  const close = (next: boolean) => {
    if (!next) {
      setRole(initialRole);
      setFormKey((k) => k + 1); // remount the forms so they start empty next time
    }
    onOpenChange(next);
  };

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>{selectedRole.help}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2">
          {ROLE_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              aria-pressed={role === value}
              className={cn(
                "flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border text-sm font-semibold transition-colors",
                role === value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {role === "waiter" ? (
          <WaiterForm key={`w${formKey}`} onDone={() => close(false)} onCancel={() => close(false)} />
        ) : (
          <AdminForm key={`a${formKey}`} onDone={() => close(false)} onCancel={() => close(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}
