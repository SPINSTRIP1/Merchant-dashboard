"use client";
import {
  CalendarCheckIn01Icon,
  CalendarRemove01Icon,
  Clock05Icon,
  PartyIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import EventsTable from "./_components/events-table";

export default function EventPlanner() {
  const stats = [
    {
      title: "All Events",
      value: 53,
      icon: PartyIcon,
      textColor: "#6932E2",
      bgColor: "#EBE2FF",
    },
    {
      title: "Upcoming Events",
      value: 63,
      icon: Clock05Icon,
      textColor: "#34C759",
      bgColor: "#DDF6E2",
    },
    {
      title: "Past Events",
      value: 63,
      icon: CalendarCheckIn01Icon,
      textColor: "#FF8D28",
      bgColor: "#F6E9DD",
    },
    {
      title: "Canceled Events",
      value: 63,
      icon: CalendarRemove01Icon,
      textColor: "#FF383C",
      bgColor: "#F6DDDD",
    },
  ];

  return (
    <div className="!overflow-x-clip">
      <div className="flex justify-between flex-wrap mb-5 gap-4">
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
      <EventsTable />
    </div>
  );
}
