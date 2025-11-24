import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import {
  Calendar03Icon,
  Chart03Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import React, { useState } from "react";
import DetailsModal from "./details-modal";
import AddEventsModal from "./add-events-modal";

export interface DealItem {
  title: string;
  location: string;
  date: string;
  tagline: string;
  imgUrl: string;
}
export const events: DealItem[] = [
  {
    title: "2025 Tech Expo",
    location: "Lekki, Lagos",
    date: "21 August, 2025",
    tagline: "ExpoHQ",
    imgUrl: "/events/1.jpg",
  },
  {
    title: "Afrochella 2025",
    location: "Lekki, Lagos",
    date: "21 August, 2025",
    tagline: "ExpoHQ",
    imgUrl: "/events/2.jpg",
  },
  {
    title: "Business Masterclass",
    location: "Lekki, Lagos",
    date: "21 August, 2025",
    tagline: "ExpoHQ",
    imgUrl: "/events/3.jpg",
  },
];

export default function EventsTable() {
  const [action, setAction] = useState<
    "add" | "edit" | "delete" | "details" | "insights" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Events</h1>
        <SearchBar
          placeholder="Search events"
          className="bg-[#F3F3F3]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown header="" options={["All", "Some"]} placeholder="All" />
          <Dropdown header="" options={["All", "Some"]} placeholder="Sort by" />
          <button
            onClick={() => setAction("add")}
            className="rounded-2xl bg-primary h-12 md:h-10 text-white flex justify-center items-center gap-2 px-4"
          >
            <HugeiconsIcon
              icon={PlusSignSquareIcon}
              size={24}
              color="#FFFFFF"
            />
            <p className="font-normal">Create Event</p>
          </button>
        </div>
      </div>
      <h2 className="text-sm mt-5 lg:text-base font-bold">My Events</h2>
      <div className="flex flex-wrap gap-4">
        {events.map((event, index) => (
          <div
            key={index}
            onClick={() => setAction("details")}
            className="mt-5 flex flex-col gap-y-2 min-w-[348px] max-w-[348px] w-full"
          >
            <div className="w-full h-[206px]">
              <Image
                src={event.imgUrl}
                alt={event.title}
                width={400}
                height={600}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <h2 className="text-sm lg:text-base font-bold">{event.title}</h2>
            <div className="flex items-center gap-x-2">
              <Image
                src={event.imgUrl}
                alt={event.title}
                width={40}
                height={40}
                className="w-5 h-5 object-cover rounded-full"
              />
              <p className="text-sm">{event.tagline}</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={24}
                  color="#6F6D6D"
                />
                <p className="text-sm">{event.location}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={24}
                  color="#6F6D6D"
                />
                <p className="text-sm">{event.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="flex items-center">
                <div className="border-2 rounded-full overflow-hidden border-white">
                  <Image
                    src={"/avatars/1.jpg"}
                    alt={event.title}
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </div>
                <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
                  <Image
                    src={"/avatars/2.jpg"}
                    alt={event.title}
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </div>
                <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
                  <Image
                    src={"/avatars/3.jpg"}
                    alt={event.title}
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </div>
                <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
                  <Image
                    src={"/avatars/4.jpg"}
                    alt={event.title}
                    width={40}
                    height={40}
                    className="w-5 h-5 object-cover"
                  />
                </div>
              </div>
              <div className="bg-background-light rounded-3xl px-1.5 py-1">
                <p className="text-[10px] text-secondary-text uppercase">
                  +24k others
                </p>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => setAction("edit")}
                  className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2"
                >
                  <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
                  <p className="font-normal text-sm">Edit</p>
                </button>

                <button
                  onClick={() => setAction("insights")}
                  className="rounded-2xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2"
                >
                  <HugeiconsIcon icon={Chart03Icon} color="#6932E2" size={16} />
                  <p className="font-normal text-sm">Insights</p>
                </button>
              </div>

              <button
                onClick={() => setAction("delete")}
                className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
              >
                <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
                <p className="font-normal text-sm">Delete</p>
              </button>
            </div>
          </div>
        ))}
      </div>
      <DetailsModal
        isOpen={action === "details"}
        onClose={() => setAction(null)}
      />
      <AddEventsModal
        isOpen={action === "add" || action === "edit"}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
