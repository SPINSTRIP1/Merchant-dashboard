"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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
import { useAdminOps, type TeamMember } from "@/hooks/use-team";
import type { PermissionKey } from "@/lib/permissions";
import PermissionGrid from "./permission-grid";

export default function ManageMemberDialog({
  member,
  onClose,
}: {
  member: TeamMember | null;
  onClose: () => void;
}) {
  // Only admin-ops members are managed here; waiters are added/removed from the Waiters list.
  const { updateAdmin: updateMember } = useAdminOps();
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [newPassword, setNewPassword] = useState("");

  // Start from the member's saved permissions each time the dialog opens
  useEffect(() => {
    setPermissions(member?.permissions ?? []);
    setNewPassword("");
  }, [member]);

  if (!member) return null;
  const isAdmin = member.role === "admin_ops";
  const passwordError =
    newPassword && newPassword.length < 6 ? "Password must be at least 6 characters" : undefined;

  const save = async () => {
    if (passwordError) return;
    if (isAdmin && permissions.length === 0) {
      toast.error("Choose at least one section this admin can access");
      return;
    }
    try {
      await updateMember.mutateAsync({
        id: member.id,
        permissions: isAdmin ? permissions : undefined,
        newPassword: newPassword || undefined,
      });
      toast.success(newPassword ? "Changes saved and password reset" : "Changes saved");
      onClose();
    } catch {
      toast.error("Could not save changes");
    }
  };

  return (
    <Dialog open={!!member} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage — {member.name}</DialogTitle>
          <DialogDescription>{member.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isAdmin && <PermissionGrid value={permissions} onChange={setPermissions} />}
          <Field
            label="Reset password"
            htmlFor="reset-password"
            error={passwordError}
            hint="Leave blank to keep their current password."
          >
            <Input
              id="reset-password"
              type="password"
              autoComplete="new-password"
              placeholder="New password (min. 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="brand" onClick={save} disabled={updateMember.isPending || !!passwordError}>
            {updateMember.isPending ? "Saving…" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
