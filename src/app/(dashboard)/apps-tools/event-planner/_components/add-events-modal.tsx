import { X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "@/app/(dashboard)/settings/_components/multi-select";
import SelectDropdown from "@/components/select-dropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { PlusSignIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function AddEventsModal({
  isOpen,
  onClose,
  action = "add",
}: {
  isOpen: boolean;
  onClose: () => void;
  action?: "edit" | "add" | null;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Trigger animation after the modal is visible
      setTimeout(() => setIsAnimating(true), 10);
    } else {
      setIsAnimating(false);
      // Hide modal after animation completes
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-end z-50 transition-all duration-300 ease-in-out ${
        isAnimating ? "bg-opacity-50" : "bg-opacity-0"
      }`}
    >
      <div
        className={`bg-white relative rounded-l-3xl p-3 lg:p-4 shadow-xl max-w-[92vw] lg:max-w-[732px] w-full h-screen overflow-y-auto scrollbar-hide transition-transform duration-300 ease-in-out ${
          isAnimating ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={handleClose}
          className="p-1 absolute top-4 left-3 bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
        >
          <X size={20} />
        </button>
        <div className="space-y-7 pt-16 pb-5">
          <div className="space-y-1.5">
            <Label>Event Name</Label>
            <Input
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Enter Event Name"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Event Description</Label>
            <Textarea
              className="rounded-2xl"
              placeholder="Enter description"
              rows={6}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Event Media</Label>
            <div className="flex overflow-x-scroll gap-5 mt-4 items-center">
              {["/events/1.jpg", "/events/2.jpg", "/events/3.jpg"].map(
                (img, index) => (
                  <div
                    key={index}
                    className="min-w-[253px] h-[206px] rounded-lg overflow-hidden"
                  >
                    <Image
                      src={img}
                      width={253}
                      height={206}
                      alt="Images"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Event Frequency</Label>
            <MultiSelect
              value={""}
              options={[
                { label: "One-Off", value: "ONE_OFF" },
                { label: "Recurring", value: "RECURRING" },
              ]}
              className="lg:grid"
              radioClassName="lg:w-full"
              onValueChange={(value) => {
                console.log(value);
              }}
            />
          </div>
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Start Date</Label>
              <Input
                type="date"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Date</Label>
              <Input
                type="date"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <Label>Start Time</Label>
              <Input
                type="time"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
              />
            </div>
            <div className="space-y-1.5">
              <Label>End Time</Label>
              <Input
                type="time"
                className="!rounded-2xl inline-block border border-neutral-accent"
                placeholder="95"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <SelectDropdown
                className="!rounded-2xl border border-neutral-accent"
                placeholder="GMT +1"
                options={[
                  "GMT -12",
                  "GMT -11",
                  "GMT -10",
                  "GMT -9",
                  "GMT -8",
                  "GMT -7",
                  "GMT -6",
                  "GMT -5",
                  "GMT -4",
                  "GMT -3",
                  "GMT -2",
                  "GMT -1",
                  "GMT +0",
                  "GMT +1",
                  "GMT +2",
                  "GMT +3",
                  "GMT +4",
                ]}
                value={""}
                onValueChange={(value) => {
                  console.log(value);
                }}
                category="Timezone"
              />
            </div>
          </div>
          <div>
            <Label>Tickets</Label>
            <div className="flex items-center pt-2 gap-x-2">
              <button className="flex-shrink-0">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button>
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
              />
              <Input
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="N0.00"
              />
            </div>
            <div className="flex items-center pt-2 gap-x-2">
              <button className="flex-shrink-0">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button>
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
              />
              <Input
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="N0.00"
              />
            </div>
            <div className="flex items-center pt-2 gap-x-2">
              <button className="flex-shrink-0">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button>
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
              />
              <Input
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="N0.00"
              />
            </div>
            <div className="flex items-center pt-2 gap-x-2">
              <button className="flex-shrink-0">
                <HugeiconsIcon
                  icon={PlusSignIcon}
                  size={24}
                  color={"#6F6D6D"}
                />
              </button>
              <Input
                className="rounded-none border-b bg-transparent border-neutral-accent"
                placeholder="Add Item"
              />
              <Input
                className="!rounded-2xl max-w-[169px] border border-neutral-accent"
                placeholder="N0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <Label>Expected Guests</Label>
              <Input
                className="!rounded-2xl border border-neutral-accent"
                placeholder="1000 Guests"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Sold Out Threshold</Label>
              <Input
                className="!rounded-2xl border border-neutral-accent"
                placeholder="500 Tickets"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Mark as Featured</Label>
            <MultiSelect
              value={""}
              options={[
                { label: "Yes", value: "YES" },
                { label: "No", value: "NO" },
              ]}
              className="lg:grid"
              radioClassName="lg:w-full"
              onValueChange={(value) => {
                console.log(value);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Add to Deal</Label>

            <SelectDropdown
              className="!rounded-2xl border border-neutral-accent"
              placeholder="Add to Deal"
              options={[
                "Retail",
                "Food & Beverage",
                "Healthcare",
                "Technology",
              ]}
              value={""}
              onValueChange={(value) => {
                console.log(value);
              }}
              category="Dealss"
            />
          </div>
          <div className="flex mt-6 gap-x-3 items-center">
            <Button
              variant={"secondary"}
              className="w-full h-[51px] py-3"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button className="w-full h-[51px] py-3" onClick={onClose}>
              {action === "add" ? "Add Event" : "Update"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
