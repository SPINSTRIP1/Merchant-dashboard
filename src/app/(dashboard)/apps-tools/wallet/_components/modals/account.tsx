import toast from "react-hot-toast";
import { Copy, Landmark } from "lucide-react";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";

/**
 * Deposit details. Shows the wallet's account number and bank when the wallet response includes
 * them; otherwise explains that funding details aren't available yet.
 */
export default function Account({
  isOpen,
  onClose,
  accountNumber,
  bankName,
}: {
  isOpen: boolean;
  onClose: () => void;
  accountNumber?: string;
  bankName?: string;
}) {
  const copy = async () => {
    if (!accountNumber) return;
    try {
      await navigator.clipboard.writeText(accountNumber);
      toast.success("Account number copied");
    } catch {
      toast.error("Couldn't copy — please copy it manually.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[420px]">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
          <Landmark className="h-5 w-5" />
        </span>
        <h2 className="font-display text-lg font-bold text-foreground">Fund your wallet</h2>
        {accountNumber ? (
          <>
            <p className="text-sm text-muted-foreground">Transfer any amount to this account</p>
            <button
              type="button"
              onClick={copy}
              className="mt-2 inline-flex items-center gap-2 font-display text-2xl font-bold tracking-wide text-foreground"
              aria-label="Copy account number"
            >
              {accountNumber} <Copy className="h-5 w-5 text-muted-foreground" />
            </button>
            {bankName && (
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{bankName}</p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your wallet&apos;s funding account isn&apos;t available yet. Check back shortly.
          </p>
        )}
      </div>
      <Button variant="brand" className="mt-6 w-full" onClick={onClose}>
        Done
      </Button>
    </Modal>
  );
}
