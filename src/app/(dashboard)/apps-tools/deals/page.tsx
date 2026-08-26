"use client";
import {
  Archive02Icon,
  CancelCircleIcon,
  DeliveryBox01Icon,
  DiscountTag02Icon,
  InformationDiamondIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import DealsTable from "./_components/deals-table";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState } from "react";
import SubscribeModal from "./_components/modals/subscribe-modal";
import Loader from "@/components/loader";
import { useDealSubscription, useDealStats } from "@/hooks/use-deals";

export default function Deals() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { subscribed, refetch, isLoading } = useDealSubscription();
  const { stats: data } = useDealStats();

  async function handleSubscribeClick() {
    setLoading(true);
    try {
      await api.patch(SERVER_URL + "/deals/subscriptions/activate");
      // console.log("Subscription activated:", res.data);
      setShowModal(true);
    } catch (error) {
      console.log("Error initiating subscription:", error);
      toast.error("Failed to initiate subscription. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    {
      title: "Total Deals",
      value: data?.total ?? 0,
      icon: DiscountTag02Icon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "Active Deals",
      value: data?.active ?? 0,
      icon: DeliveryBox01Icon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Inactive Deals",
      value: data?.inactive ?? 0,
      icon: InformationDiamondIcon,
      textColor: "#FF8D28",
      bgColor: "#F6E9DD",
    },
    {
      title: "Canceled Deals",
      value: data?.canceled ?? 0,
      icon: CancelCircleIcon,
      textColor: "#FF383C",
      bgColor: "#F6DDDD",
    },
    {
      title: "Archived Deals",
      value: data?.archived ?? 0,
      icon: Archive02Icon,
      textColor: "#0088FF",
      bgColor: "#D9EDFF",
    },
  ];
  if (isLoading) return <Loader />;
  return (
    <div>
      {subscribed || data?.active ? (
        <div>
          <div className="flex flex-wrap mb-5 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.title}
                className="bg-foreground h-[165px] max-w-[180px] md:max-w-[210px] w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2"
              >
                <div
                  className="rounded-full p-2 bg-primary-accent w-fit"
                  style={{ backgroundColor: stat.bgColor }}
                >
                  <HugeiconsIcon
                    icon={stat.icon}
                    size={24}
                    color={stat.textColor}
                  />
                </div>
                <div>
                  <p className="text-2xl text-primary-text font-bold">
                    {stat.value}
                  </p>
                  <h3 className="text-secondary-text text-lg">{stat.title}</h3>
                </div>
              </div>
            ))}
          </div>
          <DealsTable />
        </div>
      ) : (
        <div className="flex items-center justify-center flex-col gap-y-1.5 flex-1 mt-52">
          <Image
            src={"/icons/work-in-progress.svg"}
            width={600}
            height={400}
            className="w-[174px] h-[106px]"
            alt="Empty state"
          />
          <h1 className="font-bold text-primary-text">Welcome to Deals</h1>
          <p className="text-sm">Quickly subscribe to deals to begin</p>
          <Button
            onClick={handleSubscribeClick}
            size={"lg"}
            className="w-[368px] mt-2 h-[51px]"
            disabled={loading}
          >
            {loading ? "Subscribing..." : "Subscribe Now"}
          </Button>
        </div>
      )}
      <SubscribeModal
        isOpen={showModal}
        onClose={() => {
          refetch();
          setShowModal(false);
        }}
      />
    </div>
  );
}
