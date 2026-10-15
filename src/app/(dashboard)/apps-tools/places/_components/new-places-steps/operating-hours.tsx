import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MonthDayPicker } from "@/components/ui/month-day-picker";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";
import { usePlacesForm } from "../../_context";
import {
  registerPendingInput,
  unregisterPendingInput,
} from "@/components/ui/forms/form-array-input";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getOrdinalSuffix = (day: number) => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatMonthDay = (dateStr: string) => {
  if (!dateStr) return "";
  const [month, day] = dateStr.split("-").map(Number);
  if (!month || !day) return dateStr;
  const monthName = MONTHS[month - 1];
  return `${monthName} ${day}${getOrdinalSuffix(day)}`;
};

const timeInputClass = "h-10 w-[120px] text-xs sm:w-[140px]";

export default function OperatingHours() {
  const {
    form: { watch, setValue },
  } = usePlacesForm();
  const schedule = watch("operatingHours.schedule") || [];
  const holidays = watch("operatingHours.holidays") || [];
  const [valueInput, setValueInput] = useState({
    name: "",
    date: "",
    isRecurring: true,
    isOpen: true,
    openingTime: "",
    closingTime: "",
  });
  const [error, setError] = useState("");

  // Check if holiday input has enough data to be added
  const canAddHoliday = useCallback(() => {
    return (
      valueInput.name.trim() &&
      valueInput.date &&
      valueInput.openingTime &&
      valueInput.closingTime
    );
  }, [valueInput]);

  const addHoliday = useCallback(() => {
    if (!valueInput.name) {
      setError("Please enter a holiday name");
      return false;
    }
    if (!valueInput.date) {
      setError("Click on the calendar icon to select a date");
      return false;
    }
    if (!valueInput.openingTime || !valueInput.closingTime) {
      setError("Please enter opening and closing times for the holiday");
      return false;
    }
    setError("");

    const updatedHolidays = [...holidays, valueInput];
    setValue("operatingHours.holidays", updatedHolidays);
    setValueInput({
      name: "",
      date: "",
      isRecurring: true,
      isOpen: true,
      openingTime: "",
      closingTime: "",
    });
    return true;
  }, [valueInput, holidays, setValue]);

  // Register flush function for navigation
  const flushHolidayInput = useCallback(() => {
    if (canAddHoliday()) {
      addHoliday();
    }
  }, [canAddHoliday, addHoliday]);

  useEffect(() => {
    registerPendingInput(flushHolidayInput);
    return () => {
      unregisterPendingInput(flushHolidayInput);
    };
  }, [flushHolidayInput]);

  // Auto-add on blur (when all fields are filled)
  const handleBlur = () => {
    setTimeout(() => {
      if (canAddHoliday()) {
        addHoliday();
      }
    }, 150);
  };

  // Saved holidays can be edited or removed (they were read-only once added)
  const updateHoliday = (index: number, patch: Partial<(typeof holidays)[number]>) => {
    setValue(
      "operatingHours.holidays",
      holidays.map((h, i) => (i === index ? { ...h, ...patch } : h)),
    );
  };
  const removeHoliday = (index: number) => {
    setValue(
      "operatingHours.holidays",
      holidays.filter((_, i) => i !== index),
    );
  };

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-display text-sm font-bold text-foreground">Regular Hours</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Tip: Changing Monday&apos;s hours will auto-fill all other days.
        </p>
        <div className="divide-y rounded-2xl border">
          {schedule.map((hour, index) => (
            <div key={index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
              <label className="flex items-center gap-x-2.5">
                <Checkbox
                  checked={hour.isOpen}
                  onCheckedChange={(value) => {
                    const updatedSchedule = [...schedule];
                    updatedSchedule[index].isOpen = value as boolean;
                    setValue("operatingHours.schedule", updatedSchedule);
                  }}
                />
                <span className="w-24 text-sm font-semibold text-foreground">{hour.day}</span>
              </label>

              {hour.isOpen ? (
                <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                  <Input
                    className={timeInputClass}
                    type="time"
                    value={hour.openingTime}
                    onChange={(e) => {
                      const updatedSchedule = [...schedule];
                      const newTime = e.target.value;
                      updatedSchedule[index].openingTime = newTime;

                      // If Monday (index 0), auto-fill all other days
                      if (index === 0) {
                        for (let i = 1; i < updatedSchedule.length; i++) {
                          updatedSchedule[i].openingTime = newTime;
                        }
                      }

                      setValue("operatingHours.schedule", updatedSchedule);
                    }}
                  />
                  to
                  <Input
                    className={timeInputClass}
                    type="time"
                    value={hour.closingTime}
                    onChange={(e) => {
                      const updatedSchedule = [...schedule];
                      const newTime = e.target.value;
                      updatedSchedule[index].closingTime = newTime;

                      // If Monday (index 0), auto-fill all other days
                      if (index === 0) {
                        for (let i = 1; i < updatedSchedule.length; i++) {
                          updatedSchedule[i].closingTime = newTime;
                        }
                      }

                      setValue("operatingHours.schedule", updatedSchedule);
                    }}
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="font-display text-sm font-bold text-foreground">Holidays &amp; special days</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Fill all fields and they will be auto-added, or click (+) to add manually.
        </p>

        {holidays.length > 0 && (
          <div className="mb-3 divide-y rounded-2xl border">
            {holidays.map((holiday, index) => (
              <div key={index} className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{holiday.name}</p>
                  <p className="text-[11px] text-muted-foreground">{formatMonthDay(holiday.date)}</p>
                </div>
                <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                  <Input
                    className={timeInputClass}
                    type="time"
                    value={holiday.openingTime}
                    onChange={(e) => updateHoliday(index, { openingTime: e.target.value })}
                  />
                  to
                  <Input
                    className={timeInputClass}
                    type="time"
                    value={holiday.closingTime}
                    onChange={(e) => updateHoliday(index, { closingTime: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => removeHoliday(index)}
                    aria-label={`Remove ${holiday.name}`}
                    className="grid h-9 w-9 place-items-center rounded-full text-rose-500 transition-colors hover:bg-rose-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed p-3">
          <button
            type="button"
            onClick={addHoliday}
            aria-label="Add holiday"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Plus className="h-4 w-4" />
          </button>
          <Input
            className="h-10 min-w-[140px] flex-1 text-sm"
            placeholder="Holiday name"
            value={valueInput.name}
            onChange={(e) =>
              setValueInput({ ...valueInput, name: e.target.value })
            }
            onBlur={handleBlur}
          />
          <MonthDayPicker
            value={valueInput.date}
            onChange={(date) => setValueInput({ ...valueInput, date })}
          >
            <button
              type="button"
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <CalendarDays className="h-4 w-4" />
              {valueInput.date ? formatMonthDay(valueInput.date) : "Pick date"}
            </button>
          </MonthDayPicker>
          <Input
            className={timeInputClass}
            type="time"
            value={valueInput.openingTime}
            onChange={(e) =>
              setValueInput({ ...valueInput, openingTime: e.target.value })
            }
            onBlur={handleBlur}
          />
          <Input
            className={timeInputClass}
            type="time"
            value={valueInput.closingTime}
            onChange={(e) =>
              setValueInput({ ...valueInput, closingTime: e.target.value })
            }
            onBlur={handleBlur}
          />
        </div>
        {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
      </section>
    </div>
  );
}
