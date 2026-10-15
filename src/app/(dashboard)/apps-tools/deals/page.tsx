"use client";
import { Archive, Ban, PauseCircle, Tag, Zap } from "lucide-react";
import DealsTable from "./_components/deals-table";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SubscribeModal from "./_components/modals/subscribe-modal";
import Loader from "@/components/loader";
import { useDealSubscription, useDealStats } from "@/hooks/use-deals";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import StatCard from "@/components/stat-card";
import EmptyState from "@/components/empty-state";

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

  if (isLoading) return <Loader />;
  return (
    <div>
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Deals" />
      <PageHeader title="Deals" subtitle="Exclusive SpinStrip discounts to boost demand and loyalty." />
      {subscribed || data?.active ? (
        <div>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
            <StatCard index={0} label="Total Deals" value={(data?.total ?? 0).toLocaleString()} icon={<Tag />} />
            <StatCard
              index={1}
              accent
              label="Active Deals"
              value={(data?.active ?? 0).toLocaleString()}
              icon={<Zap />}
            />
            <StatCard
              index={2}
              label="Inactive Deals"
              value={(data?.inactive ?? 0).toLocaleString()}
              icon={<PauseCircle />}
            />
            <StatCard
              index={3}
              label="Canceled Deals"
              value={(data?.canceled ?? 0).toLocaleString()}
              icon={<Ban />}
            />
            <StatCard
              index={4}
              label="Archived Deals"
              value={(data?.archived ?? 0).toLocaleString()}
              icon={<Archive />}
            />
          </div>
          <DealsTable />
        </div>
      ) : (
        <div className="rounded-2xl border bg-card">
          <EmptyState
            icon={<Tag />}
            title="Welcome to Deals"
            description="Subscribe to Deals to create discount campaigns for your products and menu."
            action={
              <Button variant="brand" onClick={handleSubscribeClick} disabled={loading}>
                {loading ? "Subscribing..." : "Subscribe Now"}
              </Button>
            }
          />
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
