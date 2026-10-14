import { Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import PillGroup from "@/components/pill-group";
import ChipsInput from "@/components/chips-input";
import { cn } from "@/lib/utils";
import { useMenuForm } from "../../_context";
import type { Menu } from "../../_schemas";
import PricedListEditor from "../priced-list-editor";

const AVAILABILITY_OPTIONS: { value: Menu["availabilityType"]; label: string }[] = [
  { value: "ALWAYS_AVAILABLE", label: "Always Available" },
  { value: "SCHEDULED", label: "Specific days/time" },
  { value: "UNAVAILABLE", label: "Unavailable" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const SIZE_OPTIONS = ["Small", "Medium", "Large", "Other"];

export default function Configuration() {
  const {
    form: { watch, setValue },
  } = useMenuForm();

  const availabilityType = watch("availabilityType");
  const schedule = watch("availabilitySchedule") ?? { days: [], startTime: "", endTime: "" };
  const sizeOptions = watch("sizeOptions") ?? [];
  const nutritionAllergens = watch("nutritionAllergens") ?? [];
  const addOns = watch("addOns") ?? [];
  const extras = watch("extras") ?? [];

  const set = <K extends keyof Menu>(name: K, value: Menu[K]) =>
    setValue(name, value as never, { shouldDirty: true, shouldValidate: true });

  const toggleDay = (day: string) =>
    set("availabilitySchedule", {
      ...schedule,
      days: schedule.days.includes(day)
        ? schedule.days.filter((d) => d !== day)
        : [...schedule.days, day],
    });

  // Keep each existing entry's type; new entries are recorded as allergens.
  const setNutrition = (names: string[]) =>
    set(
      "nutritionAllergens",
      names.map(
        (name) =>
          nutritionAllergens.find((n) => n.name === name) ?? { name, type: "allergen" as const }
      )
    );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <PillGroup
          label="Availability"
          options={AVAILABILITY_OPTIONS}
          value={availabilityType}
          onChange={(value) => set("availabilityType", value)}
        />
        {availabilityType === "SCHEDULED" && (
          <div className="space-y-3 rounded-2xl border bg-muted/30 p-4">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-foreground">Serving days</p>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((day) => {
                  const on = schedule.days.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      aria-pressed={on}
                      className={cn(
                        "min-h-[34px] rounded-full border px-3 text-xs font-semibold transition-colors",
                        on
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {day.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="serve-from" className="text-xs">From</Label>
                <Input
                  id="serve-from"
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => set("availabilitySchedule", { ...schedule, startTime: e.target.value })}
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="serve-to" className="text-xs">To</Label>
                <Input
                  id="serve-to"
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => set("availabilitySchedule", { ...schedule, endTime: e.target.value })}
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Nutrition / Allergens (optional)</Label>
        <ChipsInput
          values={nutritionAllergens.map((n) => n.name)}
          onChange={setNutrition}
          placeholder="e.g. Contains nuts"
        />
        <p className="text-[11px] text-muted-foreground">Press Enter to add each one.</p>
      </div>

      <div className="space-y-2">
        <Label>Add Ons</Label>
        <PricedListEditor
          items={addOns}
          onChange={(items) => set("addOns", items)}
          namePlaceholder="e.g. Extra chicken"
          emptyText="No add-ons yet."
        />
      </div>

      <div className="space-y-2">
        <Label>Size Options</Label>
        <div className="flex flex-wrap gap-2">
          {SIZE_OPTIONS.map((size) => {
            const on = sizeOptions.includes(size);
            return (
              <button
                key={size}
                type="button"
                onClick={() =>
                  set("sizeOptions", on ? sizeOptions.filter((s) => s !== size) : [...sizeOptions, size])
                }
                aria-pressed={on}
                className={cn(
                  "inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-4 text-xs font-semibold transition-colors",
                  on
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {on && <Check className="h-3.5 w-3.5" />} {size}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Extras</Label>
        <PricedListEditor
          items={extras}
          onChange={(items) => set("extras", items)}
          namePlaceholder="Extra name"
          emptyText="No extras added yet."
        />
      </div>
    </div>
  );
}
