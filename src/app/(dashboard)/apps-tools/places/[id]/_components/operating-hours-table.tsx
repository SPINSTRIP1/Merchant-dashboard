import React from "react";

interface ScheduleDay {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

interface Holiday {
  name: string;
  date: string;
  isRecurring: boolean;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

interface OperatingHours {
  schedule: ScheduleDay[];
  holidays?: Holiday[];
}

// Format time from 24h to 12h format (e.g., "08:00" -> "8:00AM")
const formatTime = (time: string): string => {
  if (!time) return "N/A";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
};

// Day order for sorting
const DAY_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function OperatingHoursTable({
  operatingHours,
}: {
  operatingHours: OperatingHours | undefined;
}) {
  if (!operatingHours?.schedule || operatingHours.schedule.length === 0) {
    return <p className="text-secondary-text text-sm">Hours not available</p>;
  }

  // Sort schedule by day order
  const sortedSchedule = [...operatingHours.schedule].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );

  // Filter holidays that are open
  const holidays = operatingHours.holidays?.filter((h) => h.isOpen) || [];

  return (
    <div className="w-full text-sm">
      {/* Days Section */}
      <div className="mb-4">
        {/* Header */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <span className="text-primary font-medium">Days</span>
          <span className="text-primary font-medium">Opening Time</span>
          <span className="text-primary font-medium">Closing Time</span>
        </div>

        {/* Schedule Rows */}
        {sortedSchedule.map((day) => (
          <div
            key={day.day}
            className="grid grid-cols-3 gap-4 py-1.5 text-primary-text"
          >
            <span className="font-medium">{day.day}</span>
            <span>{day.isOpen ? formatTime(day.openingTime) : "Closed"}</span>
            <span>{day.isOpen ? formatTime(day.closingTime) : "-"}</span>
          </div>
        ))}
      </div>

      {/* Holidays Section */}
      {holidays.length > 0 && (
        <div className="mt-4">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4 mb-2">
            <span className="text-primary font-medium">Holidays</span>
            <span className="text-primary font-medium">Opening Time</span>
            <span className="text-primary font-medium">Closing Time</span>
          </div>

          {/* Holiday Rows */}
          {holidays.map((holiday, index) => (
            <div
              key={`${holiday.name}-${index}`}
              className="grid grid-cols-3 gap-4 py-1.5 text-primary-text"
            >
              <span className="font-medium">{holiday.name}</span>
              <span>{formatTime(holiday.openingTime)}</span>
              <span>{formatTime(holiday.closingTime)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
