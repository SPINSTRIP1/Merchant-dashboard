"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ConciergeBell, Plus, ShieldCheck, Trash2, UserCog, Users } from "lucide-react";
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
import { useTeam, type TeamMember } from "@/hooks/use-team";
import { PERMISSIONS } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { fmtDate } from "@/utils";
import AddMemberDialog from "./_components/add-member-dialog";
import ManageMemberDialog from "./_components/manage-member-dialog";

const PERMISSION_LABELS = Object.fromEntries(PERMISSIONS.map((p) => [p.key, p.label]));

function RolePill({ role }: { role: "owner" | TeamMember["role"] }) {
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

export default function AdminRolesPage() {
  const { user } = useReduxAuth();
  const { members, isLoading, updateMember, removeMember } = useTeam();
  const [addOpen, setAddOpen] = useState(false);
  const [managing, setManaging] = useState<TeamMember | null>(null);
  const [removing, setRemoving] = useState<TeamMember | null>(null);

  const toggleActive = async (member: TeamMember, active: boolean) => {
    try {
      await updateMember.mutateAsync({ id: member.id, active });
      toast.success(active ? `${member.name} can sign in again` : `${member.name} has been deactivated`);
    } catch {
      toast.error("Could not update team member");
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await removeMember.mutateAsync(removing.id);
      toast.success(`${removing.name} removed from your team`);
      setRemoving(null);
    } catch {
      toast.error("Could not remove team member");
    }
  };

  return (
    <>
      <PageHeader
        title="Admin & Roles"
        subtitle="Create waiter accounts for the waiter app, or admin operations roles with dashboard access."
        actions={
          <>
            <SampleDataBadge label="Sample team" />
            <Button variant="brand" onClick={() => setAddOpen(true)}>
              <Plus /> Add Team Member
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* The signed-in merchant is always the owner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-5"
        >
          <div className="flex items-start gap-3">
            <Avatar name={user?.fullName} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{user?.fullName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <RolePill role="owner" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Full access to every section, billing and team management.
          </p>
        </motion.div>

        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          : members.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * (i + 1) }}
                className={cn(
                  "flex flex-col rounded-2xl border bg-card p-5 transition-opacity",
                  !member.active && "opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar name={member.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-foreground">{member.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                  </div>
                  <RolePill role={member.role} />
                </div>

                <div className="mt-4 flex-1">
                  {member.role === "admin_ops" ? (
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
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Access: Waiter app only (no dashboard login).
                    </p>
                  )}
                  <p className="mt-2 text-[11px] text-muted-foreground">Added {fmtDate(member.createdAt)}</p>
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
                  <button
                    type="button"
                    onClick={() => setRemoving(member)}
                    aria-label={`Remove ${member.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-rose-500 transition-colors hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
      </div>

      {!isLoading && members.length === 0 && (
        <div className="mt-4 rounded-2xl border bg-card">
          <EmptyState
            icon={<Users />}
            title="No team members yet"
            hint="Add waiters for the waiter app, or admin ops with access to chosen sections."
            action={
              <Button variant="brand" onClick={() => setAddOpen(true)}>
                <Plus /> Add Team Member
              </Button>
            }
          />
        </div>
      )}

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} />
      <ManageMemberDialog member={managing} onClose={() => setManaging(null)} />

      <Dialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove {removing?.name}?</DialogTitle>
            <DialogDescription>
              They will lose access immediately. You can add them again later with a new password.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={removeMember.isPending}>
              {removeMember.isPending ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
