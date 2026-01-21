import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { MonthDayPicker } from "@/components/ui/month-day-picker";
import { Calendar02Icon, PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
  return (
    <div>
      <h2 className="text-primary-text mb-3">Regular Hours</h2>
      <p className="text-xs text-secondary-text mb-2">
        Tip: Changing Monday&apos;s hours will auto-fill all other days
      </p>
      {schedule.map((hour, index) => (
        <div
          key={index}
          className="flex items-center gap-x-5  px-2 my-2 justify-between"
        >
          <div className="flex gap-x-2 items-center">
            <Checkbox
              checked={hour.isOpen}
              onCheckedChange={(value) => {
                const updatedSchedule = [...schedule];
                updatedSchedule[index].isOpen = value as boolean;
                setValue("operatingHours.schedule", updatedSchedule);
              }}
            />
            <span className="font-bold text-sm">{hour.day}</span>
          </div>

          <div className="flex gap-x-2">
            <Input
              className={
                "w-[230px] inline-block !rounded-2xl border border-neutral-accent bg-[#F3F3F3] text-secondary-text"
              }
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
              disabled={!hour.isOpen}
            />
            <Input
              className={
                "w-[230px] inline-block !rounded-2xl border border-neutral-accent bg-[#F3F3F3] text-secondary-text"
              }
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
              disabled={!hour.isOpen}
            />
          </div>
        </div>
      ))}
      <h2 className="text-primary-text mb-3">Holidays</h2>
      {holidays.map((holiday, index) => (
        <div
          key={index}
          className="flex items-center px-2 my-2 gap-x-5 justify-between"
        >
          <div className="flex gap-x-2 items-center">
            <Checkbox checked={holiday.isOpen} />
            <span className="font-bold text-sm">
              {formatMonthDay(holiday.date)} - {holiday.name}
            </span>
          </div>

          <div className="flex gap-x-2">
            <Input
              className="w-[230px] inline-block !rounded-2xl border border-neutral-accent"
              type="time"
              defaultValue={holiday.openingTime}
            />
            <Input
              className="w-[230px] inline-block !rounded-2xl border border-neutral-accent"
              type="time"
              defaultValue={holiday.closingTime}
            />
          </div>
        </div>
      ))}
      <div className="flex items-center px-2 my-2 gap-x-5 justify-between">
        <div className="flex items-center flex-1 flex-shrink-0 gap-x-2">
          <button type="button" onClick={addHoliday}>
            <HugeiconsIcon icon={PlusSignIcon} size={24} color={"#6F6D6D"} />
          </button>
          <Input
            className="rounded-none border-b bg-transparent border-neutral-accent"
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
              className="cursor-pointer hover:opacity-70 transition-opacity flex flex-shrink-0 items-center gap-1"
            >
              <HugeiconsIcon
                icon={Calendar02Icon}
                size={24}
                color={"#6F6D6D"}
              />
              {valueInput.date && (
                <span className="text-sm text-secondary-text">
                  {formatMonthDay(valueInput.date)}
                </span>
              )}
            </button>
          </MonthDayPicker>
        </div>

        <div className="flex gap-x-2">
          <Input
            className="w-[200px] inline-block !rounded-2xl border border-neutral-accent"
            type="time"
            value={valueInput.openingTime}
            onChange={(e) =>
              setValueInput({ ...valueInput, openingTime: e.target.value })
            }
            onBlur={handleBlur}
          />
          <Input
            className="w-[200px] inline-block !rounded-2xl border border-neutral-accent"
            type="time"
            value={valueInput.closingTime}
            onChange={(e) =>
              setValueInput({ ...valueInput, closingTime: e.target.value })
            }
            onBlur={handleBlur}
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
      <p className="text-center pt-2 text-sm text-secondary-text">
        Fill all fields and they will be auto-added, or click (+) to add
        manually.
      </p>
    </div>
  );
}
