"use client";
import {
  AffiliateIcon,
  AlignBoxTopLeftIcon,
  ArrowRight02Icon,
  CreditCardPosIcon,
  MoneyReceive02Icon,
  MoneySend02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import TransactionHistory from "./_components/transaction-history";
import RevenueChart from "./_components/revenue-chart";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PointOfSale from "./_components/modals/point-of-sale";
import { useState } from "react";
import Account from "./_components/modals/account";
import SettlementAccount from "./_components/modals/settlement-account";
import Withdrawal from "./_components/modals/withdraw";

export default function Wallet() {
  const router = useRouter();
  const [action, setAction] = useState<
    "pos" | "account" | "settlement" | "withdraw" | null
  >(null);
  return (
    <div>
      <div className="flex items-center mb-6 gap-x-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Tools</p>
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold text-primary-text">Wallet</p>
        </button>
      </div>
      <div className="bg-foreground h-[165px] mb-5 w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2">
        <div className="flex items-center justify-between">
          <div className="rounded-full p-2 bg-primary-accent w-fit">
            <HugeiconsIcon
              icon={AlignBoxTopLeftIcon}
              size={24}
              color={"#6932E2"}
            />
          </div>
          <div className="flex items-center gap-x-5">
            <button
              onClick={() => setAction("account")}
              className="flex items-center gap-x-2"
            >
              <div className="size-12 rounded-full flex items-center bg-primary justify-center">
                <HugeiconsIcon
                  icon={MoneyReceive02Icon}
                  size={24}
                  color={"#F8F8F8"}
                />
              </div>
              <p className="text-primary-text">Deposit</p>
            </button>
            <button
              onClick={() => setAction("withdraw")}
              className="flex items-center gap-x-2"
            >
              <div className="size-12 rounded-full flex items-center bg-primary justify-center">
                <HugeiconsIcon
                  icon={MoneySend02Icon}
                  size={24}
                  color={"#F8F8F8"}
                />
              </div>
              <p className="text-primary-text">Withdraw</p>
            </button>
            <button
              onClick={() => setAction("pos")}
              className="flex items-center gap-x-2"
            >
              <div className="size-12 rounded-full flex items-center bg-primary justify-center">
                <HugeiconsIcon
                  icon={CreditCardPosIcon}
                  size={24}
                  color={"#F8F8F8"}
                />
              </div>
              <p className="text-primary-text">POS</p>
            </button>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div>
            <p className="text-2xl text-primary-text font-bold">N0.00</p>
            <h3 className="text-secondary-text text-lg">Balance</h3>
          </div>
          <button
            onClick={() => setAction("settlement")}
            className="flex items-center w-fit bg-primary-accent py-2 px-2.5 rounded-3xl gap-x-2"
          >
            <HugeiconsIcon icon={AffiliateIcon} size={21} color={"#6932E2"} />
            <p className="text-primary line-clamp-1">Add Settlement Account</p>
            <div className="p-1.5 rounded-full bg-primary">
              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={16}
                color={"white"}
              />
            </div>
          </button>
        </div>
      </div>
      <div className="flex flex-wrap mb-5 gap-4">
        <div className="bg-foreground h-[165px] max-w-[180px] md:max-w-[210px] w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2">
          <div className="rounded-full p-2 bg-primary-accent w-fit">
            <HugeiconsIcon
              icon={AlignBoxTopLeftIcon}
              size={24}
              color={"#6932E2"}
            />
          </div>
          <div>
            <p className="text-2xl text-primary-text font-bold">N0.00</p>
            <h3 className="text-secondary-text text-lg">Revenue</h3>
          </div>
        </div>
        <div className="bg-foreground h-[165px] max-w-[180px] md:max-w-[210px] w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2">
          <div className="rounded-full p-2 bg-primary-accent w-fit">
            <HugeiconsIcon
              icon={AlignBoxTopLeftIcon}
              size={24}
              color={"#6932E2"}
            />
          </div>
          <div>
            <p className="text-2xl text-primary-text font-bold">N0.00</p>
            <h3 className="text-secondary-text text-lg">Withdrawal</h3>
          </div>
        </div>
      </div>
      <RevenueChart />
      <TransactionHistory />

      <PointOfSale isOpen={action === "pos"} onClose={() => setAction(null)} />
      <Account isOpen={action === "account"} onClose={() => setAction(null)} />
      <SettlementAccount
        isOpen={action === "settlement"}
        onClose={() => setAction(null)}
      />
      <Withdrawal
        isOpen={action === "withdraw"}
        onClose={() => setAction(null)}
      />
    </div>
  );
}
