import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { useWalletPin, useWithdraw } from "@/hooks/use-wallet-extras";
import { formatNaira } from "@/utils";
import { BankIcon, CheckmarkCircle01Icon, LockPasswordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React, { useCallback } from "react";
import toast from "react-hot-toast";

type Step = "amount" | "pin" | "set-pin" | "done";

const isPin = (value: string) => /^\d{4,6}$/.test(value);
const digitsOnly = (value: string, max: number) => value.replace(/\D/g, "").slice(0, max);

export default function Withdrawal({
  isOpen,
  onClose,
  onAddSettlementAccount,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddSettlementAccount?: () => void;
}) {
  const [step, setStep] = React.useState<Step>("amount");
  const [amount, setAmount] = React.useState<number | null>(null);
  const [pin, setPin] = React.useState("");
  // Set / reset PIN form
  const [resetting, setResetting] = React.useState(false);
  const [otpSent, setOtpSent] = React.useState(false);
  const [otpCode, setOtpCode] = React.useState("");
  const [newPin, setNewPin] = React.useState("");
  const [confirmPin, setConfirmPin] = React.useState("");

  const { accounts, defaultAccount, isLoading: isLoadingAccounts } = useBankAccounts();
  const { hasPin, blocker, requestOtp, savePin } = useWalletPin();
  const withdraw = useWithdraw();
  const [selectedAccountId, setSelectedAccountId] = React.useState<string>("");

  // Default to the merchant's default settlement account once accounts load.
  React.useEffect(() => {
    if (defaultAccount && !selectedAccountId) {
      setSelectedAccountId(defaultAccount.id);
    }
  }, [defaultAccount, selectedAccountId]);

  const selectedAccount = accounts.find((account) => account.id === selectedAccountId) ?? defaultAccount;

  const openPinSetup = (reset: boolean) => {
    setResetting(reset);
    setOtpSent(false);
    setOtpCode("");
    setNewPin("");
    setConfirmPin("");
    setStep("set-pin");
  };

  const goToPin = () => {
    // No PIN on record yet: set one first. (`null` = unknown, so just ask for it.)
    if (hasPin === false) openPinSetup(false);
    else setStep("pin");
  };

  const handleWithdraw = async () => {
    if (!selectedAccount || !amount || !isPin(pin)) return;
    try {
      await withdraw.mutateAsync({
        amount,
        bankCode: selectedAccount.bankCode,
        bankAccountNumber: selectedAccount.accountNumber,
        walletPin: pin,
      });
      setStep("done");
    } catch (error) {
      toast.error((error as Error).message || "Withdrawal failed");
    }
  };

  const sendOtp = async () => {
    try {
      await requestOtp.mutateAsync();
      setOtpSent(true);
      toast.success("We've emailed you a code");
    } catch (error) {
      toast.error((error as Error).message || "Couldn't send the code");
    }
  };

  const handleSavePin = async () => {
    if (!isPin(newPin) || newPin !== confirmPin || !otpCode) return;
    try {
      await savePin.mutateAsync({ pin: newPin, otpCode, reset: resetting });
      toast.success(resetting ? "Transaction PIN reset" : "Transaction PIN set");
      setPin("");
      setStep("pin");
    } catch (error) {
      toast.error((error as Error).message || "Couldn't save your PIN");
    }
  };

  const handleClose = useCallback(() => {
    setStep("amount");
    setPin("");
    setAmount(null);
    onClose();
  }, [onClose]);

  const icon = step === "done" ? CheckmarkCircle01Icon : step === "amount" ? BankIcon : LockPasswordIcon;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[760px] flex flex-col items-center gap-y-1.5 justify-center"
    >
      <div className="bg-card relative overflow-hidden p-3 mb-2 rounded-full shadow-md">
        <HugeiconsIcon icon={icon} size={24} color="currentColor" className="text-primary z-[999]" />
        <Image
          src={"/icons/check.svg"}
          className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
          width={40}
          height={40}
          alt="check"
        />
      </div>

      {step === "done" && (
        <>
          <h2 className="font-bold text-primary-text">Withdrawal submitted</h2>
          <p className="text-center text-sm">
            {amount ? formatNaira(amount) : "Your funds"} is on its way to {selectedAccount?.bankName}{" "}
            {selectedAccount?.accountNumber}. It will show in your transaction history once it completes.
          </p>
          <Button size={"lg"} className="mt-3 w-full" onClick={handleClose}>
            Done
          </Button>
        </>
      )}

      {step === "amount" && (
        <>
          <h2 className="font-bold text-primary-text">Withdraw Funds</h2>

          {isLoadingAccounts ? (
            <div className="py-8">
              <div className="size-6 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : blocker ? (
            <>
              <p className="text-sm text-center mb-2">Withdrawals aren&apos;t available on this wallet yet.</p>
              <p className="mb-4 rounded-xl bg-muted px-4 py-3 text-center text-xs text-secondary-text">{blocker}</p>
              <Button size={"lg"} variant={"secondary"} className="w-full" onClick={handleClose}>
                Close
              </Button>
            </>
          ) : !selectedAccount ? (
            <>
              <p className="text-sm text-center mb-4">
                You have no settlement account yet. Add one to withdraw your funds.
              </p>
              <Button
                size={"lg"}
                className="w-full mt-2"
                onClick={() => {
                  handleClose();
                  onAddSettlementAccount?.();
                }}
              >
                Add Settlement Account
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm">Funds will be withdrawn to your settlement account</p>
              <h2 className="font-bold text-sm text-primary-text">
                {selectedAccount.accountName} {selectedAccount.accountNumber}
              </h2>
              <div className="flex justify-center mb-4 items-center gap-x-1">
                <div className="size-4 bg-neutral-accent rounded-full" />
                <p className="uppercase font-bold text-xxs text-center text-secondary-text">
                  {selectedAccount.bankName}
                </p>
              </div>

              {accounts.length > 1 && (
                <div className="w-full space-y-2 mb-4">
                  <Label>Settlement Account</Label>
                  <Select value={selectedAccount.id} onValueChange={setSelectedAccountId}>
                    <SelectTrigger className="w-full !rounded-2xl border bg-muted border-neutral-accent !h-[49px]">
                      <SelectValue placeholder="Select an account" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Settlement Accounts</SelectLabel>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.bankName} • {account.accountNumber}
                            {account.isDefault ? " (Default)" : ""}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="w-full space-y-2 mb-4">
                <Label>Amount</Label>
                <Input
                  type="number"
                  className="!rounded-2xl border border-neutral-accent"
                  placeholder="Enter amount"
                  value={amount !== null ? amount : ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
              </div>

              <Button onClick={goToPin} disabled={!amount || amount < 100} size={"lg"} className="w-full mt-2">
                Confirm
              </Button>
            </>
          )}
        </>
      )}

      {step === "pin" && (
        <>
          <h2 className="font-bold text-primary-text">Enter Transaction PIN</h2>
          <p className="text-center text-sm text-secondary-text">
            Withdraw {amount ? formatNaira(amount) : ""} to {selectedAccount?.bankName} {selectedAccount?.accountNumber}
          </p>

          <div className="my-4 w-full max-w-[260px] border-b pb-5">
            <Input
              autoFocus
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              aria-label="Transaction PIN"
              placeholder="••••"
              value={pin}
              onChange={(e) => setPin(digitsOnly(e.target.value, 6))}
              onKeyDown={(e) => e.key === "Enter" && handleWithdraw()}
              className="h-14 text-center text-2xl font-bold tracking-[0.5em]"
            />
          </div>

          <div className="flex w-full items-center gap-x-4 mt-3">
            <Button size={"lg"} variant={"secondary"} className="w-full flex-1" onClick={() => setStep("amount")}>
              Back
            </Button>
            <Button
              onClick={handleWithdraw}
              disabled={!isPin(pin) || withdraw.isPending}
              size={"lg"}
              className="w-full flex-1"
            >
              {withdraw.isPending ? "Processing…" : "Withdraw"}
            </Button>
          </div>
          <div className="w-full">
            <button
              type="button"
              onClick={() => openPinSetup(true)}
              className="text-sm text-left text-secondary-text mt-2 hover:text-primary"
            >
              Forgot PIN?
            </button>
          </div>
        </>
      )}

      {step === "set-pin" && (
        <>
          <h2 className="font-bold text-primary-text">{resetting ? "Reset Transaction PIN" : "Set a Transaction PIN"}</h2>
          <p className="text-center text-sm text-secondary-text">
            {resetting
              ? "We'll email you a code to confirm it's you."
              : "You need a 4–6 digit PIN to approve withdrawals. We'll email you a code to confirm it's you."}
          </p>

          {!otpSent ? (
            <Button size={"lg"} className="mt-4 w-full" onClick={sendOtp} disabled={requestOtp.isPending}>
              {requestOtp.isPending ? "Sending…" : "Email me a code"}
            </Button>
          ) : (
            <div className="mt-3 w-full space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="pin-otp">Code from your email</Label>
                <Input
                  id="pin-otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(digitsOnly(e.target.value, 8))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="new-pin">New PIN</Label>
                  <Input
                    id="new-pin"
                    type="password"
                    inputMode="numeric"
                    value={newPin}
                    onChange={(e) => setNewPin(digitsOnly(e.target.value, 6))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirm-pin">Confirm PIN</Label>
                  <Input
                    id="confirm-pin"
                    type="password"
                    inputMode="numeric"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(digitsOnly(e.target.value, 6))}
                  />
                </div>
              </div>
              {confirmPin && newPin !== confirmPin && <p className="text-xs text-rose-500">PINs don&apos;t match</p>}
              <Button
                size={"lg"}
                className="w-full"
                onClick={handleSavePin}
                disabled={!otpCode || !isPin(newPin) || newPin !== confirmPin || savePin.isPending}
              >
                {savePin.isPending ? "Saving…" : "Save PIN"}
              </Button>
              <button
                type="button"
                onClick={sendOtp}
                disabled={requestOtp.isPending}
                className="text-xs text-secondary-text hover:text-primary"
              >
                Resend code
              </button>
            </div>
          )}
          <Button
            size={"lg"}
            variant={"secondary"}
            className="mt-2 w-full"
            onClick={() => setStep(hasPin === false && !resetting ? "amount" : "pin")}
          >
            Back
          </Button>
        </>
      )}
    </Modal>
  );
}
