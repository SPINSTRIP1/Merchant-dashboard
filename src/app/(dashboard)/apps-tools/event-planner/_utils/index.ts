export const mergeDateTime = (date: string, time: string): string => {
  // date is expected to be in YYYY-MM-DD format
  // time is expected to be in HH:mm format
  return `${date}T${time}:00Z`;
};

// ...existing code...

/**
 * Extracts time from an ISO datetime string (e.g., "2026-01-13T18:03:00.000Z")
 * Returns time in "HH:mm" format for time input fields
 */
export function extractTimeFromDateTime(dateTime: string): string {
  if (!dateTime) return "";

  try {
    // Extract the time portion from the ISO string
    const timePart = dateTime.split("T")[1];
    if (!timePart) return "";

    // Get HH:mm from the time portion (e.g., "18:03" from "18:03:00.000Z")
    return timePart.substring(0, 5);
  } catch {
    return "";
  }
}

// ...existing code...
