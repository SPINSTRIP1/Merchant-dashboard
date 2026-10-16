"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ConciergeBell, Plus, ShieldCheck, Smartphone, Trash2, UserCog } from "lucide-react";
import PageHeader from "@/components/page-header";
import EmptyState from "@/components/empty-state";
import SampleDataBadge from "@/components/sample-data-badge";
import { getInitials } from "@/components/sidebar-content";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { useAdminOps, useWaiters, type TeamMember, type TeamRole } from "@/hooks/use-team";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/utils";
import AddMemberDialog from "./_components/add-member-dialog";
import ManageMemberDialog from "./_components/manage-member-dialog";

const PERMISSION_LABELS = Object.fromEntries(PERMISSIONS.map((p) => [p.key, p.label]));

function RolePill({ role }: { role: "owner" | TeamRole }) {
  if (role === "owner")
    return (
      <span className="brand-gradient inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white">
        <ShieldCheck className="h-3 w-3" /> Owner
      </span>
    );
  if (role === "admin_ops")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
        <UserCog className="h-3 w-3" /> Admin Ops
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
      <ConciergeBell className="h-3 w-3" /> Waiter
    </span>
  );
}

function Avatar({ name }: { name?: string }) {
  return (
    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
      {getInitials(name)}
    </div>
  );
}

function MemberHeader({ member }: { member: TeamMember }) {
  return (
    <div className="flex items-start gap-3">
      <Avatar name={member.name} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{member.name}</p>
        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
      </div>
      <RolePill role={member.role} />
    </div>
  );
}

const RemoveButton = ({ member, onClick }: { member: TeamMember; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`Remove ${member.name}`}
    className="grid h-9 w-9 place-items-center rounded-full text-rose-500 transition-colors hover:bg-rose-500/10"
  >
    <Trash2 className="h-4 w-4" />
  </button>
);

function SectionHeading({ title, hint, badge }: { title: string; hint: string; badge?: React.ReactNode }) {
  return (
    <div className="mb-3 mt-8 flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      {badge}
    </div>
  );
}

export default function AdminRolesPage() {
  const { user } = useReduxAuth();
  const { waiters, isLoading: waitersLoading, removeWaiter } = useWaiters();
  const { admins, isLoading: adminsLoading, updateAdmin, removeAdmin } = useAdminOps();
  const [adding, setAdding] = useState<TeamRole | null>(null);
  const [managing, setManaging] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const toggleActive = async (member: TeamMember, active: boolean) => {
    try {
      await updateAdmin.mutateAsync({ id: member.id, active });
      toast.success(active ? `${member.name} can sign in again` : `${member.name} has been deactivated`);
    } catch {
      toast.error("Could not update team member");
    }
  };

  const isRemoving = removeWaiter.isPending || removeAdmin.isPending;
  const confirmRemove = async () => {
    if (!removing) return;
    try {
      if (removing.role === "waiter") await removeWaiter.mutateAsync(removing.id);
      else await removeAdmin.mutateAsync(removing.id);
      toast.success(`${removing.name} removed from your team`);
      setRemoving(null);
    } catch (error) {
      toast.error((error as Error).message || "Could not remove team member");
    }
  };

  return (
    <>
      <PageHeader
        title="Admin & Roles"
        subtitle="Add waiters for the SpinStrip waiter app, or admin operations roles with dashboard access."
        actions={
          <Button variant="brand" onClick={() => setAdding("waiter")}>
            <Plus /> Add Team Member
          </Button>
        }
      />

      {/* The signed-in merchant is always the owner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card p-5 lg:max-w-[calc(50%-0.5rem)]"
      >
        <div className="flex items-start gap-3">
          <Avatar name={user?.fullName} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-foreground">{user?.fullName}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <RolePill role="owner" />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Full access to every section, billing and team management.</p>
      </motion.div>

      <SectionHeading
        title={`Waiters${waiters.length ? ` (${waiters.length})` : ""}`}
        hint="Waiters sign in to the SpinStrip waiter app to pick up paid orders, chat with guests and get live updates."
      />
      {waitersLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-2xl" />
          ))}
        </div>
      ) : waiters.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<ConciergeBell />}
            title="No waiters yet"
            description="Add a waiter by the email of their SpinStrip account."
            action={
              <Button variant="brand" onClick={() => setAdding("waiter")}>
                <Plus /> Add Waiter
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {waiters.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className="flex flex-col rounded-2xl border bg-card p-5"
            >
              <MemberHeader member={member} />
              <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Smartphone className="h-3.5 w-3.5" /> Waiter app only — no dashboard access.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t pt-4">
                <span className="text-[11px] text-muted-foreground">
                  {member.createdAt ? `Added ${fmtDate(member.createdAt)}` : "Active waiter"}
                </span>
                <span className="ml-auto" />
                <RemoveButton member={member} onClick={() => setRemoving(member)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <SectionHeading
        title="Admin Operations"
        hint="Staff who sign in to this dashboard and see only the sections you choose."
        badge={<SampleDataBadge label="Sample — not saved yet" />}
      />
      {adminsLoading ? (
        <Skeleton className="h-40 rounded-2xl lg:max-w-[calc(50%-0.5rem)]" />
      ) : admins.length === 0 ? (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<UserCog />}
            title="No admin ops yet"
            description="Give a manager access to chosen dashboard sections."
            action={
              <Button variant="outline" onClick={() => setAdding("admin_ops")}>
                <Plus /> Add Admin Ops
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {admins.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className={cn("flex flex-col rounded-2xl border bg-card p-5 transition-opacity", !member.active && "opacity-60")}
            >
              <MemberHeader member={member} />
              <div className="mt-4 flex-1">
                <div className="flex flex-wrap gap-1.5">
                  {member.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground"
                    >
                      {PERMISSION_LABELS[perm]}
                    </span>
                  ))}
                </div>
                {member.createdAt && (
                  <p className="mt-2 text-[11px] text-muted-foreground">Added {fmtDate(member.createdAt)}</p>
                )}
              </div>
              <div className="mt-4 flex items-center gap-2 border-t pt-4">
                <Button size="sm" variant="outline" onClick={() => setManaging(member)}>
                  Manage
                </Button>
                <label className="ml-auto flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  Active
                  <Switch
                    showLabel={false}
                    checked={member.active}
                    onCheckedChange={(active) => toggleActive(member, active)}
                    aria-label={`${member.active ? "Deactivate" : "Activate"} ${member.name}`}
                  />
                </label>
                <RemoveButton member={member} onClick={() => setRemoving(member)} />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AddMemberDialog
        key={adding ?? "closed"}
        open={!!adding}
        initialRole={adding ?? "waiter"}
        onOpenChange={(open) => !open && setAdding(null)}
      />
      <ManageMemberDialog member={managing} onClose={() => setManaging(null)} />

      <Dialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>
              {removing?.role === "waiter"
                ? "They'll stop seeing your restaurant in the waiter app, and any orders they're handling go back to the queue for another waiter."
                : "They will lose access immediately. You can add them again later with a new password."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={isRemoving}>
              {isRemoving ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
