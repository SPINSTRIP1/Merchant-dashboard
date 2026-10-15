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

// "12-26" (MM-DD) -> "26 Dec"
const formatHolidayDate = (date: string) => {
  const [month, day] = date.split("-").map(Number);
  if (!month || !day) return date;
  return new Date(2000, month - 1, day).toLocaleDateString("en-NG", { day: "numeric", month: "short" });
};

// Day order for sorting
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function OperatingHoursTable({
  operatingHours,
}: {
  operatingHours: OperatingHours | undefined;
}) {
  if (!operatingHours?.schedule || operatingHours.schedule.length === 0) {
    return <p className="text-sm text-muted-foreground">Hours not available</p>;
  }

  const sortedSchedule = [...operatingHours.schedule].sort(
    (a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day),
  );
  const holidays = operatingHours.holidays ?? [];

  return (
    <div className="w-full text-xs">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b text-[10px] uppercase tracking-wide text-muted-foreground">
            <th className="py-2 font-semibold">Days</th>
            <th className="py-2 font-semibold">Opening</th>
            <th className="py-2 font-semibold">Closing</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {sortedSchedule.map((day) => (
            <tr key={day.day} className="text-foreground">
              <td className="py-2 font-semibold">{day.day.slice(0, 3)}</td>
              {day.isOpen ? (
                <>
                  <td className="py-2">{formatTime(day.openingTime)}</td>
                  <td className="py-2">{formatTime(day.closingTime)}</td>
                </>
              ) : (
                <td className="py-2 text-muted-foreground" colSpan={2}>
                  Closed
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {holidays.length > 0 && (
        <>
          <h5 className="mb-2 mt-4 font-display text-sm font-bold text-foreground">Holidays</h5>
          <ul className="space-y-1.5">
            {holidays.map((holiday, index) => (
              <li
                key={`${holiday.name}-${index}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/50 px-3 py-2"
              >
                <span className="font-semibold text-foreground">{holiday.name}</span>
                <span className="text-muted-foreground">
                  {formatHolidayDate(holiday.date)}
                  {holiday.isOpen
                    ? ` · ${formatTime(holiday.openingTime)} - ${formatTime(holiday.closingTime)}`
                    : " · Closed"}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
