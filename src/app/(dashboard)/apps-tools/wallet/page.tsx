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
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { SERVER_URL, USER_ACCOUNT_URL } from "@/constants";
import toast from "react-hot-toast";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Loader from "@/components/loader";
import { useReduxAuth } from "@/hooks/use-redux-auth";
import { KYCData } from "./_types";
import { countries } from "@/data/countries";

export default function Wallet() {
  const router = useRouter();
  const [action, setAction] = useState<
    "pos" | "account" | "settlement" | "withdraw" | null
  >(null);

  const { user } = useReduxAuth();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["user-wallets"],
    queryFn: async () => {
      try {
        const response = await api.get(USER_ACCOUNT_URL + "/wallet");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching wallet data:", error);
        toast.error("Failed to fetch wallet data.");
        return [];
      }
    },
  });

  const { data: kycData } = useQuery<KYCData>({
    queryKey: ["compliance-data"],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + "/kyc/merchant/status");
        return response.data.data;
      } catch (error) {
        console.log("Error fetching compliance status:", error);
        return {} as KYCData;
      }
    },
  });

  const [loading, setLoading] = useState(false);

  async function handleCreateWallet() {
    const nin = kycData?.ubos[0]?.identityMetadata?.nin;
    const bvn = kycData?.ubos[0]?.identityMetadata?.bvn;
    const address = kycData?.ubos[0]?.address;
    const currency = countries.find(
      (c) => c.name === kycData?.countryOfIncorporation,
    )?.currency;

    if (!nin || !bvn || !address) {
      toast.error(
        "Missing KYC information. Please complete your KYC to create a wallet.",
      );
      return;
    }

    if (!currency) {
      toast.error(
        "Could not determine currency from country of incorporation.",
      );
      return;
    }

    setLoading(true);
    try {
      await api.post(USER_ACCOUNT_URL + "/wallet", {
        currency: currency,
        customer_email: user?.email,
        customer_mobile: user?.phoneNumber,
        customer_name: user?.fullName,
        bvn: bvn,
        nin: nin,
        address: address,
        dob: user?.dob || "1990-05-14",
      });

      toast.success("Wallet created successfully!");
      refetch();
    } catch (error) {
      console.log("Error initiating wallet creation:", error);
      toast.error("Failed to create wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  console.log(data);

  if (isLoading) return <Loader />;

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
      {data?.length === 0 ? (
        <div className="flex items-center justify-center flex-col gap-y-1.5 flex-1 mt-52">
          <Image
            src={"/icons/work-in-progress.svg"}
            width={600}
            height={400}
            className="w-[174px] h-[106px]"
            alt="Empty state"
          />
          <h1 className="font-bold text-primary-text">Welcome to Wallet</h1>
          <p className="text-sm">
            Quickly set up your wallet to start accepting payments and managing
            your finances.
          </p>
          <Button
            onClick={handleCreateWallet}
            disabled={loading}
            size={"lg"}
            className="w-[368px] mt-2 h-[51px]"
          >
            {loading ? "Creating Wallet..." : "Create Wallet"}
          </Button>
        </div>
      ) : (
        <>
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
                <HugeiconsIcon
                  icon={AffiliateIcon}
                  size={21}
                  color={"#6932E2"}
                />
                <p className="text-primary line-clamp-1">
                  Add Settlement Account
                </p>
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
        </>
      )}

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
