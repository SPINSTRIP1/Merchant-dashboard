"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { ConciergeBell, Eye, EyeOff, UserCog } from "lucide-react";
import Field from "@/components/field";
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
import { useTeam, type TeamRole } from "@/hooks/use-team";
import type { PermissionKey } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import PermissionGrid from "./permission-grid";

const schema = z.object({
  name: z.string().trim().min(2, "Enter the team member's full name"),
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormValues = z.infer<typeof schema>;

const ROLE_OPTIONS: { value: TeamRole; label: string; icon: typeof UserCog; help: string }[] = [
  {
    value: "waiter",
    label: "Waiter",
    icon: ConciergeBell,
    help: "Waiters sign into the waiter app only — no dashboard access.",
  },
  {
    value: "admin_ops",
    label: "Admin Operations",
    icon: UserCog,
    help: "Admin ops sign into this dashboard. You choose exactly what they can see.",
  },
];

export default function AddMemberDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { createMember } = useTeam();
  const [role, setRole] = useState<TeamRole>("waiter");
  const [permissions, setPermissions] = useState<PermissionKey[]>(["overview"]);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });
  const { errors } = form.formState;

  const close = (next: boolean) => {
    if (!next) {
      form.reset();
      setRole("waiter");
      setPermissions(["overview"]);
      setShowPassword(false);
    }
    onOpenChange(next);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (role === "admin_ops" && permissions.length === 0) {
      toast.error("Choose at least one section this admin can access");
      return;
    }
    try {
      await createMember.mutateAsync({ ...values, role, permissions });
      toast.success("Team member created");
      close(false);
    } catch (error) {
      toast.error((error as Error).message || "Could not create team member");
    }
  });

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role)!;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>{selectedRole.help}</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
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

          {role === "admin_ops" && <PermissionGrid value={permissions} onChange={setPermissions} />}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="brand" disabled={createMember.isPending}>
              {createMember.isPending ? "Creating…" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
