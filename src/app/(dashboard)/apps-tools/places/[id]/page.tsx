"use client";
import { cn } from "@/lib/utils";
import {
  AddSquareIcon,
  Cash02Icon,
  ChartLineData01Icon,
  CheckListIcon,
  CircleArrowReload01Icon,
  DesertIcon,
  DrinkIcon,
  FavouriteIcon,
  MenuRestaurantIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import React, { useState } from "react";
import FacilityManagement from "./_components/facility-management";
import BookingReservation from "./_components/booking-reservation";
import { SERVER_URL } from "@/constants";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/loader";
import { ChevronLeft } from "lucide-react";
import ActivitiesExperience from "./_components/activities-experience";
import EmptyState from "@/components/empty-state";
import VisitorList from "./_components/visitor-list";
import Reviews from "./_components/reviews";
import api from "@/lib/api/axios-client";
import { useQuery } from "@tanstack/react-query";
import { SinglePlace } from "../_components/claim-places-steps/find-place";
import { Event } from "../../event-planner/_schemas";

export default function Page() {
  const { id } = useParams();
  const { data: place, isLoading } = useQuery<SinglePlace>({
    queryKey: ["single-place", id],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + `/places/${id}`);
        return response.data.data;
      } catch (error) {
        console.log("Error fetching products:", error);
        return [];
      }
    },
  });
  const router = useRouter();
  const stats = [
    {
      title: "Visitors",
      value: place?.stats.visitors ?? 0,
      icon: DrinkIcon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "Facilities",
      value: place?.stats.facilities ?? 0,
      icon: DesertIcon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Revenue",
      value: place?.stats.revenue ?? 0,
      icon: Cash02Icon,
      textColor: "#FF9500",
      bgColor: "#F6E9DD",
    },
    {
      title: "Sales",
      value: place?.stats.sales ?? 0,
      icon: ChartLineData01Icon,
      textColor: "#FF3B30",
      bgColor: "#F6DDDD",
    },
    {
      title: "Reservations",
      value: place?.stats.reservations ?? 0,
      icon: CircleArrowReload01Icon,
      textColor: "#0088FF",
      bgColor: "#D9EDFF",
    },
  ];

  const quickLinks = [
    {
      title: "Add Event",
      icon: AddSquareIcon,
      link: "/apps-tools/event-planner",
    },
    {
      title: "Update Menu/Services",
      icon: MenuRestaurantIcon,
      link: "/apps-tools/menu",
    },
    {
      title: "Manage Reviews",
      icon: FavouriteIcon,
      link: "/apps-tools/reviews",
    },
    {
      title: "Manage Bookings",
      icon: CheckListIcon,
      link: "/apps-tools/bookings",
    },
  ] as const;

  const [selectedOption, setSelectedOption] = useState<string>(
    "Facility Management",
  );
  const events: Event[] = [];

  const renderContent = () => {
    switch (selectedOption) {
      case "Facility Management":
        return <FacilityManagement place={place} />;
      case "Visitor Management":
        return <VisitorList />;

      case "Bookings & Reservations":
        return <BookingReservation />;

      case "Activities & Experiences":
        return events.length === 0 ? (
          <EmptyState
            // icon={<MapPin className="h-16 w-16 text-primary" />}
            title="No Activities or Experiences"
            description={
              "No activities or experiences available for this place yet"
            }
          />
        ) : (
          <>
            <ActivitiesExperience
              events={events}
              title="Activities in this Place"
            />
            <ActivitiesExperience
              events={events}
              title="Events in this Place"
            />
          </>
        );
      case "Reviews":
        return <Reviews />;
      default:
        return null;
    }
  };
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      <div className="flex items-center mb-6 gap-x-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft /> <p className="font-bold">Places</p>
        </button>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-x-2"
        >
          <ChevronLeft />{" "}
          <p className="font-bold text-primary-text">{place?.name}</p>
        </button>
      </div>
      <div className="flex flex-wrap mb-5 gap-5 2xl:grid 2xl:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-foreground h-[165px] max-w-[180px] md:max-w-[210px] 2xl:max-w-full w-full p-4 rounded-[32px] flex flex-col justify-between gap-y-2"
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
      <h2 className="font-bold mb-5">Quicklinks</h2>
      <div className="flex flex-wrap gap-5 2xl:grid 2xl:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.title}
            href={item.link}
            className="p-6 bg-foreground relative rounded-[32px] w-full md:min-w-[269px] md:max-w-[269px] 2xl:max-w-full flex flex-col items-center justify-center h-[165px] gap-2 cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-primary-accent rounded-full flex items-center justify-center">
              <HugeiconsIcon icon={item.icon} size={24} color={"#6932E2"} />
            </div>
            <h3>{item.title}</h3>
          </Link>
        ))}
      </div>
      <div className="mt-10 mb-5  flex items-center justify-center w-full">
        {[
          "Facility Management",
          "Visitor Management",
          "Bookings & Reservations",
          "Activities & Experiences",
          "Reviews",
        ].map((feature) => (
          <span
            onClick={() => setSelectedOption(feature)}
            key={feature}
            className={cn(
              "px-4 border-b font-bold cursor-pointer",
              selectedOption === feature
                ? "border-primary-text text-primary-text "
                : "text-neutral-accent border-neutral-accent",
            )}
          >
            {feature}
          </span>
        ))}
      </div>
      {renderContent()}
    </div>
  );
}
