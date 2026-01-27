import { PLACE_TYPES } from "../_constants";

export const getPlaceType = (place: string) => {
  const placeType = PLACE_TYPES.find((type) => type.value === place)?.label;
  return placeType;
};

interface ScheduleDay {
  day: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
}

interface OperatingHours {
  schedule: ScheduleDay[];
  holidays?: Array<{
    name: string;
    date: string;
    isRecurring: boolean;
    isOpen: boolean;
    openingTime: string;
    closingTime: string;
  }>;
}

// Format time from 24h to 12h format (e.g., "08:00" -> "8AM")
const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return minutes === 0
    ? `${hour12}${period}`
    : `${hour12}:${minutes.toString().padStart(2, "0")}${period}`;
};

// Get formatted operating hours display string
export const getOperatingHoursDisplay = (
  operatingHours: OperatingHours | undefined,
): string => {
  if (!operatingHours?.schedule || operatingHours.schedule.length === 0) {
    return "Hours not available";
  }

  const schedule = operatingHours.schedule;
  const allClosed = schedule.every((day) => !day.isOpen);

  if (allClosed) {
    return "Closed";
  }

  const allOpen = schedule.every((day) => day.isOpen);
  const allSameHours = schedule.every(
    (day) =>
      day.openingTime === schedule[0].openingTime &&
      day.closingTime === schedule[0].closingTime,
  );

  // Check if open 24/7
  if (
    allOpen &&
    allSameHours &&
    schedule[0].openingTime === "00:00" &&
    schedule[0].closingTime === "23:59"
  ) {
    return "Open 24 hours daily";
  }

  // If all days have same hours
  if (allOpen && allSameHours) {
    return `Open daily ${formatTime(schedule[0].openingTime)} - ${formatTime(schedule[0].closingTime)}`;
  }

  // Group weekdays (Mon-Fri) and weekends (Sat-Sun)
  const weekdays = schedule.filter((d) =>
    ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(d.day),
  );
  const weekends = schedule.filter((d) =>
    ["Saturday", "Sunday"].includes(d.day),
  );

  const weekdaysOpen = weekdays.filter((d) => d.isOpen);
  const weekendsOpen = weekends.filter((d) => d.isOpen);

  const weekdaysSameHours =
    weekdaysOpen.length > 0 &&
    weekdaysOpen.every(
      (d) =>
        d.openingTime === weekdaysOpen[0].openingTime &&
        d.closingTime === weekdaysOpen[0].closingTime,
    );

  const weekendsSameHours =
    weekendsOpen.length > 0 &&
    weekendsOpen.every(
      (d) =>
        d.openingTime === weekendsOpen[0].openingTime &&
        d.closingTime === weekendsOpen[0].closingTime,
    );

  const parts: string[] = [];

  // Weekdays
  if (weekdaysOpen.length === 5 && weekdaysSameHours) {
    parts.push(
      `Mon - Fri ${formatTime(weekdaysOpen[0].openingTime)} - ${formatTime(weekdaysOpen[0].closingTime)}`,
    );
  } else if (weekdaysOpen.length > 0 && weekdaysSameHours) {
    // Some weekdays open with same hours
    parts.push(
      `Mon - Fri ${formatTime(weekdaysOpen[0].openingTime)} - ${formatTime(weekdaysOpen[0].closingTime)}`,
    );
  } else if (weekdaysOpen.length === 0) {
    parts.push("Closed Mon - Fri");
  }

  // Weekends
  if (weekendsOpen.length === 2 && weekendsSameHours) {
    parts.push(
      `Sat - Sun ${formatTime(weekendsOpen[0].openingTime)} - ${formatTime(weekendsOpen[0].closingTime)}`,
    );
  } else if (weekendsOpen.length > 0) {
    // Weekends have different hours - show each day
    const saturday = weekendsOpen.find((d) => d.day === "Saturday");
    const sunday = weekendsOpen.find((d) => d.day === "Sunday");

    if (saturday && sunday) {
      parts.push(
        `Sat ${formatTime(saturday.openingTime)} - ${formatTime(saturday.closingTime)}`,
      );
      parts.push(
        `Sun ${formatTime(sunday.openingTime)} - ${formatTime(sunday.closingTime)}`,
      );
    } else if (saturday) {
      parts.push(
        `Sat ${formatTime(saturday.openingTime)} - ${formatTime(saturday.closingTime)}`,
      );
    } else if (sunday) {
      parts.push(
        `Sun ${formatTime(sunday.openingTime)} - ${formatTime(sunday.closingTime)}`,
      );
    }
  } else if (weekendsOpen.length === 0 && parts.length > 0) {
    parts.push("Closed Sat - Sun");
  }

  if (parts.length > 0) {
    return parts.join(" • ");
  }

  // Fallback: just show if open today or generic message
  const openDays = schedule.filter((d) => d.isOpen);
  if (openDays.length > 0) {
    return `Open ${openDays.length} days/week`;
  }

  return "Hours vary";
};
