/**
 * Settings features the backend doesn't support yet. SAMPLE DATA:
 * - Preferences (notifications, auto-settlement) are saved in this browser only.
 * - Change password is simulated — the API only has the OTP forgot/reset flow.
 * Swap these for real endpoints when they exist; nothing else depends on them.
 */
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { createPersistentMap } from "@/mocks/utils";

export interface MerchantPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklySummary: boolean;
  autoSettlement: boolean;
}

export const DEFAULT_PREFERENCES: MerchantPreferences = {
  emailNotifications: true,
  pushNotifications: true,
  weeklySummary: false,
  autoSettlement: true,
};

const store = createPersistentMap<MerchantPreferences>("spinstrip:preferences");

export function usePreferences(userKey = "me") {
  const [preferences, setPreferences] = useState<MerchantPreferences>(DEFAULT_PREFERENCES);

  // Read after mount so server and client render the same defaults first.
  useEffect(() => {
    setPreferences({ ...DEFAULT_PREFERENCES, ...store.get(userKey) });
  }, [userKey]);

  const setPreference = useCallback(
    <K extends keyof MerchantPreferences>(key: K, value: MerchantPreferences[K]) => {
      setPreferences((prev) => {
        const next = { ...prev, [key]: value };
        store.set(userKey, next);
        return next;
      });
      toast.success("Preference saved");
    },
    [userKey]
  );

  return { preferences, setPreference };
}

export function useChangePassword() {
  const [isPending, setIsPending] = useState(false);

  const changePassword = async ({ current, next }: { current: string; next: string }) => {
    if (!current || next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return false;
    }
    setIsPending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setIsPending(false);
    toast.success("Password changed (sample — not saved yet)");
    return true;
  };

  return { changePassword, isPending };
}
