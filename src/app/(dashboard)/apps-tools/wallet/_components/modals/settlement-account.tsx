import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form } from "@/components/ui/form";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormSelect } from "@/components/ui/forms/form-select";
import { Label } from "@/components/ui/label";
import {
  useBankAccounts,
  useBanks,
  useResolveBankAccount,
} from "@/hooks/use-bank-accounts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BankIcon,
  CheckmarkCircle01Icon,
  Delete02Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React, { useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const settlementAccountSchema = z.object({
  bankCode: z.string().min(1, "Select a bank"),
  accountNumber: z
    .string()
    .regex(/^\d{10}$/, "Account number must be 10 digits"),
  label: z.string().optional(),
  isDefault: z.boolean(),
});

type SettlementAccountForm = z.infer<typeof settlementAccountSchema>;

type Step = "list" | "form" | "success";

export default function SettlementAccount({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = React.useState<Step>("list");

  const { banks, isLoading: isLoadingBanks } = useBanks();
  const {
    accounts,
    isLoading: isLoadingAccounts,
    createBankAccount,
    isCreating,
    setDefaultAccount,
    deleteBankAccount,
    isUpdating,
    isDeleting,
  } = useBankAccounts();

  const form = useForm<SettlementAccountForm>({
    resolver: zodResolver(settlementAccountSchema),
    mode: "onChange",
    defaultValues: {
      bankCode: "",
      accountNumber: "",
      label: "",
      isDefault: false,
    },
  });

  const { control, watch, setValue, reset, handleSubmit, formState } = form;
  const bankCode = watch("bankCode");
  const accountNumber = watch("accountNumber");
  const isDefault = watch("isDefault");

  // Resolving is also what verifies the account with the API before saving it.
  const { resolvedAccount, isResolving } = useResolveBankAccount({
    accountNumber,
    bankCode,
  });

  // Nothing saved yet — skip the list and open the form straight away.
  React.useEffect(() => {
    if (isOpen && !isLoadingAccounts && accounts.length === 0) {
      setStep((prev) => (prev === "list" ? "form" : prev));
    }
  }, [isOpen, isLoadingAccounts, accounts.length]);

  const handleClose = useCallback(() => {
    setStep("list");
    reset();
    onClose();
  }, [onClose, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!resolvedAccount?.accountName) return;

    const account = await createBankAccount({
      accountNumber: values.accountNumber,
      bankCode: values.bankCode,
      currency: "NGN",
      accountName: resolvedAccount.accountName,
      bankName:
        resolvedAccount.bankName ||
        banks.find((bank) => bank.code === values.bankCode)?.name ||
        "",
      label: values.label || undefined,
      // The first account saved always becomes the payout destination.
      isDefault: values.isDefault || accounts.length === 0,
    });

    if (account) {
      reset();
      setStep("success");
    }
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      className="max-w-[760px] flex flex-col items-center justify-center"
    >
      <div className="bg-white relative overflow-hidden p-3 mb-2 rounded-full shadow-md">
        <HugeiconsIcon
          icon={step === "success" ? CheckmarkCircle01Icon : BankIcon}
          size={24}
          color={"#6932E2"}
          className="z-[999]"
        />
        <Image
          src={"/icons/check.svg"}
          className="size-[36px] absolute opacity-60 -bottom-3 z-10 -left-3"
          width={40}
          height={40}
          alt="check"
        />
      </div>

      {step === "success" && (
        <>
          <h2 className="font-bold text-primary-text">Successful</h2>
          <p className="text-sm">Your Settlement Account has been updated</p>
          <Button
            size={"lg"}
            variant={"secondary"}
            onClick={() => setStep("list")}
            className="w-full mt-4"
          >
            Done
          </Button>
        </>
      )}

      {step === "list" && (
        <>
          <h2 className="font-bold text-primary-text">Settlement Accounts</h2>
          <p className="text-sm mb-4">
            Withdrawals are paid into your default settlement account
          </p>

          {isLoadingAccounts ? (
            <div className="py-8">
              <div className="size-6 animate-spin rounded-full border-b-2 border-primary" />
            </div>
          ) : (
            <div className="w-full space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between gap-x-3 rounded-2xl border border-neutral-accent p-3"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-primary-text truncate">
                      {account.accountName}
                    </p>
                    <p className="text-sm text-secondary-text truncate">
                      {account.bankName} • {account.accountNumber}
                    </p>
                    {account.label && (
                      <p className="text-xs text-secondary-text truncate">
                        {account.label}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-x-2 shrink-0">
                    {account.isDefault ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                        Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => setDefaultAccount(account.id)}
                        className="rounded-full border border-neutral-accent px-2 py-0.5 text-xs text-secondary-text disabled:opacity-50"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => deleteBankAccount(account.id)}
                      className="disabled:opacity-50"
                      aria-label="Remove account"
                    >
                      <HugeiconsIcon
                        icon={Delete02Icon}
                        size={18}
                        color={"#DC2626"}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={() => setStep("form")}
            className="flex items-center gap-x-1 mt-5 border border-neutral-accent px-1.5 rounded-3xl py-0.5"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} color={"#6F6D6D"} />
            <p>
              {accounts.length > 0
                ? "Add Alternative Account"
                : "Add Settlement Account"}
            </p>
          </button>
        </>
      )}

      {step === "form" && (
        <>
          <h2 className="font-bold text-primary-text mb-3">
            Add Settlement Account
          </h2>
          <Form {...form}>
            <form onSubmit={onSubmit} className="w-full space-y-5">
              <FormSelect
                control={control}
                name="bankCode"
                label="Bank"
                category="Banks"
                disabled={isLoadingBanks}
                placeholder={
                  isLoadingBanks ? "Loading banks..." : "Select your bank"
                }
                options={banks.map((bank) => ({
                  label: bank.name,
                  value: bank.code,
                }))}
              />

              <FormInput
                control={control}
                name="accountNumber"
                label="Account Number"
                inputMode="numeric"
                maxLength={10}
                placeholder="Enter account number"
                className="!rounded-2xl border border-neutral-accent"
              />

              <div className="w-full space-y-2">
                <Label>Account Name</Label>
                <div className="flex h-[49px] items-center rounded-2xl border border-neutral-accent bg-[#F3F3F3] px-4">
                  {isResolving ? (
                    <div className="flex items-center gap-x-2">
                      <div className="size-4 animate-spin rounded-full border-b-2 border-primary" />
                      <p className="text-sm text-secondary-text">
                        Verifying account...
                      </p>
                    </div>
                  ) : (
                    <p
                      className={
                        resolvedAccount?.accountName
                          ? "text-sm font-bold text-primary-text"
                          : "text-sm text-secondary-text"
                      }
                    >
                      {resolvedAccount?.accountName ||
                        "Select a bank and enter a 10-digit account number"}
                    </p>
                  )}
                </div>
                {!isResolving &&
                  !resolvedAccount?.accountName &&
                  formState.isValid && (
                    <p className="text-sm text-red-600">
                      We couldn&apos;t verify this account. Check the bank and
                      account number.
                    </p>
                  )}
              </div>

              <FormInput
                control={control}
                name="label"
                label="Label (optional)"
                placeholder="e.g. My salary account"
                className="!rounded-2xl border border-neutral-accent"
              />

              <div className="flex items-center gap-x-2">
                <Checkbox
                  id="isDefault"
                  checked={isDefault || accounts.length === 0}
                  disabled={accounts.length === 0}
                  onCheckedChange={(checked) =>
                    setValue("isDefault", checked === true)
                  }
                />
                <Label htmlFor="isDefault" className="cursor-pointer">
                  Make this my default settlement account
                </Label>
              </div>

              <div className="flex w-full items-center gap-x-4">
                {accounts.length > 0 && (
                  <Button
                    type="button"
                    size={"lg"}
                    variant={"secondary"}
                    className="w-full flex-1"
                    onClick={() => {
                      reset();
                      setStep("list");
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  size={"lg"}
                  disabled={
                    !formState.isValid ||
                    !resolvedAccount?.accountName ||
                    isResolving ||
                    isCreating
                  }
                  className="w-full flex-1"
                >
                  {isCreating ? "Saving..." : "Confirm"}
                </Button>
              </div>
            </form>
          </Form>
        </>
      )}
    </Modal>
  );
}
