"use client";

import { useState } from "react";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import Image from "next/image";
import { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";
import {
  Globe02Icon,
  Location01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

// Props type
interface AddEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Event;
}

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters"),

    email: z.email("Please enter a valid email address"),
    confirmEmail: z.string().min(1, "Please confirm your email address"),
  })
  .refine((data) => data.email === data.confirmEmail, {
    message: "Emails don't match",
    path: ["confirmEmail"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function CheckOutModal({
  isOpen,
  onClose,
  place,
}: AddEventsModalProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [currentStep, setCurrentStep] = useState<number>(1);
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      confirmEmail: "",
    },
  });
  const [notificationPermission, setNotificationPermission] = useState({
    email: false,
    update: false,
  });
  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...form}>
        <div className="space-y-7 pt-14 pb-5">
          <div className="w-full h-[180px]">
            <Image
              src={place?.images?.[0] || ""}
              alt={place.name}
              width={1200}
              height={560}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <h2 className="text-base lg:text-[58px] mb-3 leading-[100%] text-black font-bold">
                {place.name}
              </h2>

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <p className="text-sm">
                    {place.city}, {place.state}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon icon={Time01Icon} size={24} color="#6F6D6D" />
                  <p className="text-sm">Open 24 hours daily</p>
                </div>
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon icon={Globe02Icon} size={24} color="#6F6D6D" />
                  <p className="text-sm">www.reallygreatsite.com</p>
                </div>
              </div>
            </div>
            <div className="flex items-center my-2 gap-x-4">
              <div className="flex items-center gap-x-2">
                <Image
                  src={place?.images?.[0] || ""}
                  alt={place.name}
                  width={40}
                  height={40}
                  className="w-6 h-6 object-cover rounded-full"
                />
                <p className="text-lg text-primary-text">
                  {place.tagline || ""}
                </p>
              </div>
              <button className="flex items-center bg-primary gap-x-0.5 rounded-xl px-2.5 py-1.5">
                <Image
                  src={"/logo-mark.svg"}
                  alt={place.name}
                  width={40}
                  height={40}
                  className="w-5 h-5 object-contain"
                />
                <p className="text-sm text-white">Follow</p>
              </button>
            </div>
          </div>

          {/* Buy Ticket Section */}
          {currentStep === 1 && (
            <>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="text-sm flex items-center gap-x-5">
                      <div className="border-[#E0E0E0] py-1.5 px-2 flex items-center gap-x-1 border rounded-2xl w-full">
                        <div className="bg-[#E0E0E0] rounded-2xl py-0.5 px-2">
                          <p className=" text-primary-text">Check In</p>
                        </div>
                        <p className="text-primary-text font-bold">
                          {dateRange?.from
                            ? format(dateRange.from, "M/d/yy")
                            : "Select"}
                        </p>
                      </div>
                      <div className="border-[#E0E0E0] py-1.5 px-2 flex items-center gap-x-1 border rounded-2xl w-full">
                        <div className="bg-[#E0E0E0] rounded-2xl py-0.5 px-2">
                          <p className=" text-primary-text">Check Out</p>
                        </div>
                        <p className="text-primary-text font-bold">
                          {dateRange?.to
                            ? format(dateRange.to, "M/d/yy")
                            : "Select"}
                        </p>
                      </div>
                    </div>
                    <div className="border border-[#E0E0E0] rounded-2xl p-2">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                        disabled={{ before: new Date() }}
                      />
                    </div>
                  </div>
                  <div className="bg-neutral rounded-lg p-2">
                    <h3 className="font-bold text-primary-text text-sm mb-3">
                      Order Summary
                    </h3>

                    <div className="flex mb-1.5 font-normal justify-between">
                      <p>5 Nights Standard Room Adults</p>
                      <p>₦200,000</p>
                    </div>

                    <div className="flex mt-2 pt-2 border-t border-gray-300 font-bold justify-between">
                      <p>TOTAL</p>
                      <p>₦200,000</p>
                    </div>
                  </div>
                </div>

                {/* Total and Checkout */}
                {dateRange?.to && dateRange?.from && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                    size={"lg"}
                  >
                    Proceed to Checkout
                  </Button>
                )}
              </div>
            </>
          )}
          {currentStep === 2 && (
            <div className="bg-neutral rounded-lg p-2">
              <h3 className="font-bold text-primary-text text-sm mb-3">
                Order Summary
              </h3>

              <div className="flex mb-1.5 font-normal justify-between">
                <p>5 Nights Standard Room Adults</p>
                <p>₦200,000</p>
              </div>

              <div className="flex mt-2 pt-2 border-t border-gray-300 font-bold justify-between">
                <p>TOTAL</p>
                <p>₦200,000</p>
              </div>
            </div>
          )}
          {currentStep === 2 && (
            <div>
              <h2 className="text-primary-text text-lg font-bold">
                Contact Information
              </h2>
              <p className="text-sm text-primary-text">
                <Link href="/login" className="font-bold text-primary">
                  Login to SpinStrip
                </Link>{" "}
                for a better experience
              </p>
              <div className="space-y-4 mt-3">
                <FormInput
                  control={form.control}
                  name="firstName"
                  label="First Name"
                  placeholder="Enter First name"
                  type="text"
                />
                <FormInput
                  control={form.control}
                  name="lastName"
                  label="Last Name"
                  placeholder="Enter Last name"
                  type="text"
                />
                <FormInput
                  control={form.control}
                  name="email"
                  label="Email Address"
                  placeholder="Enter Email Address"
                />
                <FormInput
                  control={form.control}
                  name="confirmEmail"
                  label="Confirm Email Address"
                  placeholder="Confirm Email Address"
                />
              </div>
              <p className="text-sm mt-4 text-[#000000E5]">
                By clicking “Register”I Agree to the{" "}
                <Link href="/login" className="font-bold text-primary">
                  SpinStrip Terms of Service
                </Link>{" "}
              </p>
              <div className="flex gap-x-2 my-3 items-center">
                <Checkbox
                  checked={notificationPermission.update}
                  onCheckedChange={(value) =>
                    setNotificationPermission((prev) => ({
                      ...prev,
                      update: value as boolean,
                    }))
                  }
                />
                <span className="text-[#000000E5] text-sm">
                  Keep me updated on more places and news from this place
                  organizer.
                </span>
              </div>
              <div className="flex gap-x-2 my-2 items-center">
                <Checkbox
                  checked={notificationPermission.email}
                  onCheckedChange={(value) =>
                    setNotificationPermission((prev) => ({
                      ...prev,
                      email: value as boolean,
                    }))
                  }
                />
                <span className="text-[#000000E5] text-sm">
                  Send me emails about the best events happening nearby or
                  online.
                </span>
              </div>
              <Button className="w-[190px] lg:w-[368px] mt-4" size={"lg"}>
                Register
              </Button>
              <div className="flex mt-6 items-center gap-x-1.5 border-t pt-3">
                <p className="text-sm">Powered by</p>
                <Image
                  src={"/logo-black.svg"}
                  alt="SpinStrip"
                  width={100}
                  height={100}
                  className="w-[78px] h-[24px] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </FormProvider>
    </SideModal>
  );
}
