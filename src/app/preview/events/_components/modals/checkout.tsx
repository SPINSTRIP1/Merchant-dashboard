"use client";

import { useCallback, useState } from "react";
import SideModal from "@/app/(dashboard)/_components/side-modal";
import Image from "next/image";
import {
  Calendar03Icon,
  Location01Icon,
  MinusSignIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatDateDisplay } from "@/utils";
import ImpressionsStack from "@/app/(dashboard)/apps-tools/event-planner/_components/impressions-stack";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/forms/form-input";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z, { set } from "zod";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { PublicEvent } from "../../page";
import { useHandleRequest } from "@/hooks/use-fetch";

// Props type
interface AddEventsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: PublicEvent;
}

interface TicketSelection {
  tierId: string;
  quantity: number;
  price: number;
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
  event,
}: AddEventsModalProps) {
  const [selectedTickets, setSelectedTickets] = useState<TicketSelection[]>([]);

  const handleTicketSelect = (tierId: string, price: number) => {
    const existingIndex = selectedTickets.findIndex((t) => t.tierId === tierId);
    if (existingIndex !== -1) {
      // Remove ticket if already selected
      setSelectedTickets(selectedTickets.filter((t) => t.tierId !== tierId));
    } else {
      // Add new ticket selection
      setSelectedTickets([...selectedTickets, { tierId, quantity: 1, price }]);
    }
  };

  const handleQuantityChange = (tierId: string, change: number) => {
    const tier = event.ticketTiers?.find((t) => t.id === tierId);
    const maxQuantity = tier?.quantityAvailable ?? 10;

    setSelectedTickets(
      selectedTickets.map((ticket) => {
        if (ticket.tierId === tierId) {
          const newQuantity = ticket.quantity + change;
          if (newQuantity >= 1 && newQuantity <= maxQuantity) {
            return { ...ticket, quantity: newQuantity };
          }
        }
        return ticket;
      }),
    );
  };

  const getTicketSelection = (tierId: string) => {
    return selectedTickets.find((t) => t.tierId === tierId);
  };

  const totalPrice = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.price * ticket.quantity,
    0,
  );

  const totalTickets = selectedTickets.reduce(
    (sum, ticket) => sum + ticket.quantity,
    0,
  );
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
  const handleReset = useCallback(() => {
    form.reset();
    setCurrentStep(1);
    setSelectedTickets([]);
    setNotificationPermission({ email: false, update: false });
  }, [form]);

  const { loading, handleRequest } = useHandleRequest({
    route: `/events/public/${event.id}/register`,
    action: "post",
    params: {
      firstName: form.getValues("firstName"),
      lastName: form.getValues("lastName"),
      email: form.getValues("email"),
      confirmEmail: form.getValues("confirmEmail"),
      tickets: selectedTickets.map((ticket) => ({
        ticketTierId: ticket.tierId,
        quantity: ticket.quantity,
      })),
      marketingConsentEvents: notificationPermission.email,
      marketingConsentNews: notificationPermission.update,
      paymentProvider: "PAYSTACK",
      callbackUrl: "https://merchant.spinstrip.com",
    },
    successMessage: "Registration successful!",
    onSuccess: (data) => {
      console.log(data);
      const paymentUrl = data?.payment?.data?.authorization_url;
      if (paymentUrl) {
        window.open(paymentUrl, "_blank");
      }
      handleReset();
      onClose();
    },
  });

  return (
    <SideModal isOpen={isOpen} onClose={onClose}>
      <FormProvider {...form}>
        <div className="space-y-7 pt-14 pb-5">
          <div className="w-full h-[180px]">
            <img
              src={event?.images?.[0] || ""}
              alt={event.name}
              width={1200}
              height={560}
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm lg:text-[58px] mb-3 leading-[100%] text-black font-medium">
                {event.name}
              </h2>

              <div className="flex items-center gap-x-3">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <p className="text-sm">
                    {event.city}, {event.state}
                  </p>
                </div>
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <p className="text-sm">
                    {formatDateDisplay(event.startDate)}
                  </p>
                </div>
                <ImpressionsStack impressions={event.totalImpressions ?? 0} />
              </div>
            </div>

            <button className="flex items-center my-2 bg-primary gap-x-0.5 rounded-xl px-2.5 py-1.5">
              <Image
                src={"/logo-mark.svg"}
                alt={event.name}
                width={40}
                height={40}
                className="w-5 h-5 object-contain"
              />
              <p className="text-sm text-white">Follow</p>
            </button>
          </div>

          {/* Buy Ticket Section */}
          {currentStep === 1 && (
            <>
              <div className="space-y-4">
                <h2 className="font-bold text-lg text-primary-text">
                  Buy Ticket
                </h2>
                <div className="flex ">
                  <div className="h-auto w-1 border-l border-[#6F6D6D]" />
                  <div className="space-y-3 w-full flex-1">
                    {event.ticketTiers?.map((tier) => {
                      const selection = getTicketSelection(tier.id || "");
                      const isSelected = !!selection;
                      return (
                        <div key={tier.id} className={`px-2 transition-all`}>
                          <div className="flex items-start justify-between">
                            <h3 className="text-sm ">{tier.name}</h3>

                            {/* Checkbox - Right Side */}
                            <div className="flex flex-col justify-end items-end">
                              <div className="flex items-center gap-x-2">
                                <p className="text-sm font-bold">
                                  ₦{tier.price.toLocaleString()}
                                </p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleTicketSelect(
                                      tier.id || "",
                                      tier.price,
                                    )
                                  }
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "border-primary"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                                  )}
                                </button>
                              </div>
                              {isSelected && selection && (
                                <div className="flex items-center mt-2 gap-x-3">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(tier.id || "", -1)
                                    }
                                    disabled={selection.quantity <= 1}
                                    className="w-6 h-6 rounded-full bg-neutral-accent hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-600"
                                  >
                                    <HugeiconsIcon
                                      icon={MinusSignIcon}
                                      size={16}
                                      color="#6F6D6D"
                                    />
                                  </button>
                                  <span className="text-center font-semibold">
                                    {selection.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(tier.id || "", 1)
                                    }
                                    disabled={
                                      selection.quantity >=
                                      tier.quantityAvailable
                                    }
                                    className="w-6 h-6 rounded-full bg-neutral-accent hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-gray-600"
                                  >
                                    <HugeiconsIcon
                                      icon={PlusSignIcon}
                                      size={16}
                                      color="#6F6D6D"
                                    />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Total and Checkout */}
                {selectedTickets.length > 0 && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="w-full"
                    size={"lg"}
                  >
                    Checkout ({totalTickets}{" "}
                    {totalTickets === 1 ? "ticket" : "tickets"} - ₦
                    {totalPrice.toLocaleString()})
                  </Button>
                )}
              </div>
              <div>
                <p className="mb-3 text-sm text-primary-text">
                  Ticket sales end on {formatDateDisplay(event.startDate)}
                </p>
                <div
                  className="w-full h-[2px]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #C8C8C8 8px, transparent 8px)",
                    backgroundSize: "16px 2px",
                    backgroundRepeat: "repeat-x",
                  }}
                />
              </div>
            </>
          )}
          <div className="bg-neutral rounded-lg p-2">
            <h3 className="font-bold text-primary-text text-sm mb-3">
              Order Summary
            </h3>
            {selectedTickets.map((ticket) => {
              const tier = event.ticketTiers?.find(
                (t) => t.id === ticket.tierId,
              );
              return (
                <div
                  key={ticket.tierId}
                  className="flex mb-1.5 font-normal justify-between"
                >
                  <p>
                    {ticket.quantity} X {tier?.name} Ticket
                  </p>
                  <p>₦{(ticket.price * ticket.quantity).toLocaleString()}</p>
                </div>
              );
            })}
            <div className="flex mt-2 pt-2 border-t border-gray-300 font-bold justify-between">
              <p>TOTAL</p>
              <p>₦{totalPrice.toLocaleString()}</p>
            </div>
          </div>
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
                  Keep me updated on more events and news from this event
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
              <Button
                disabled={!form.formState.isValid || loading}
                onClick={handleRequest}
                className="w-[368px] mt-4"
                size={"lg"}
              >
                {loading ? "Processing..." : "Register"}
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
