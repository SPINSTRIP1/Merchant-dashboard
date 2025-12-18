"use client";

import { PLACES_SERVER_URL } from "@/constants";
import { useServerPagination } from "@/hooks/use-server-pagination";
import PlacesModal from "./_components/modals/places-modal";
import ContainerWrapper from "@/components/container-wrapper";
import AddButton from "../../_components/add-button";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight02Icon } from "@hugeicons/core-free-icons";
import { Place } from "./_schemas";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePlacesForm } from "./_context";
import Loader from "@/components/loader";

export default function PlacesPage() {
  // const stats = [
  //   {
  //     title: "Total Deals",
  //     value: data?.total ?? 0,
  //     icon: DiscountTag02Icon,
  //     textColor: "#6932E2",
  //     bgColor: "#EBE2FF",
  //   },
  //   {
  //     title: "Active Deals",
  //     value: data?.active ?? 0,
  //     icon: DeliveryBox01Icon,
  //     textColor: "#34C759",
  //     bgColor: "#DDF6E2",
  //   },
  //   {
  //     title: "Inactive Deals",
  //     value: data?.inactive ?? 0,
  //     icon: InformationDiamondIcon,
  //     textColor: "#FF8D28",
  //     bgColor: "#F6E9DD",
  //   },
  //   {
  //     title: "Canceled Deals",
  //     value: data?.canceled ?? 0,
  //     icon: CancelCircleIcon,
  //     textColor: "#FF383C",
  //     bgColor: "#F6DDDD",
  //   },
  //   {
  //     title: "Archived Deals",
  //     value: data?.archived ?? 0,
  //     icon: Archive02Icon,
  //     textColor: "#0088FF",
  //     bgColor: "#D9EDFF",
  //   },
  // ];
  // if (isLoading) return <Loader />;
  const { items, isLoading } = useServerPagination<Place>({
    queryKey: "places",
    endpoint: `${PLACES_SERVER_URL}/places`,
  });

  const { action, setAction } = usePlacesForm();
  if (isLoading) return <Loader />;
  return (
    <div>
      {items && items.length > 0 ? (
        <ContainerWrapper>
          <div className="flex mb-3 items-center justify-between">
            <h1 className="text-lg font-bold">Published Places</h1>
            <AddButton title="Add Place" onClick={() => setAction("add")} />
          </div>
          {items.map((place) => (
            <Link
              key={place.id}
              href={`/apps-tools/places/${place.id}`}
              className="py-3 border-b last:border-b-0 last:pb-1 flex items-center justify-between"
            >
              <p className="font-medium">
                {place.name} - {place.city}
              </p>

              <HugeiconsIcon
                icon={ArrowRight02Icon}
                size={22}
                color={"#6F6D6D"}
              />
            </Link>
          ))}
        </ContainerWrapper>
      ) : (
        <div className="flex items-center justify-center flex-col gap-y-1.5 flex-1 mt-52">
          <Image
            src={"/icons/work-in-progress.svg"}
            width={600}
            height={400}
            className="w-[174px] h-[106px]"
            alt="Empty state"
          />
          <h1 className="font-bold text-primary-text">Welcome to Places</h1>
          <p className="text-sm">
            Set up Places tto get the most out of your facility
          </p>
          <Button
            onClick={() => setAction("add")}
            size={"lg"}
            className="w-[368px] mt-2 h-[51px]"
          >
            Get Started
          </Button>
        </div>
      )}
      <PlacesModal isOpen={action === "add"} onClose={() => setAction(null)} />
    </div>
  );
}
