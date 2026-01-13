"use client";
import ContainerWrapper from "@/components/container-wrapper";
import { Time01Icon } from "@hugeicons/core-free-icons";
import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import RegistrationChart from "./_components/registration-chart";
import RegistrationTable from "./_components/table";
import TicketSalesChart from "./_components/ticket-sales-chart";
import { Event } from "../_schemas";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api/axios-client";
import { SERVER_URL } from "@/constants";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/loader";
import { extractTimeFromDateTime } from "../_utils";
import { formatDateDisplay } from "@/utils";
import ImpressionsStack from "../_components/impressions-stack";

export default function SalesAndRegistration() {
  const id = useSearchParams().get("id");
  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["single-event", id],
    queryFn: async () => {
      try {
        const response = await api.get(SERVER_URL + `/events/${id}`);
        return response.data.data;
      } catch (error) {
        console.log("Error fetching products:", error);
        return null;
      }
    },
    enabled: !!id,
  });
  if (isLoading) return <Loader />;
  if (!event) return <p>No event found.</p>;
  return (
    <div>
      <ContainerWrapper>
        <h1 className="font-bold text-2xl text-primary-text">{event.name}</h1>

        <div className="flex flex-col md:flex-row gap-4 mt-3 overflow-x-auto">
          {event.images?.map((image, index) => (
            <div key={index} className="w-full md:w-[250px] h-[206px]">
              <Image
                src={image}
                alt={event.name}
                width={400}
                height={600}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          ))}
        </div>
        <p className="my-3">{event.description}</p>
        <div className="grid grid-cols-2 md:flex items-center justify-between gap-3 my-3">
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">
              {event.city}, {event.state}
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Time01Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">
              {extractTimeFromDateTime(event.startDate)} {event.timezone}
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Calendar03Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">{formatDateDisplay(event.endDate)}</p>
          </div>

          <ImpressionsStack impressions={event.totalImpressions ?? 0} />
        </div>

        <div className="text-sm mt-5">
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Total Registrations
            </h2>
            <p>{event.totalTransactions ?? 0}</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Total Tickets Sales
            </h2>
            <p>
              {event.ticketSalesBreakdown?.reduce(
                (acc, curr) => acc + Number(curr),
                0
              ) ?? 0}
            </p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Total Ticket Sales Via Deal
            </h2>
            <p>0</p>
          </div>{" "}
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Sold Out Threshold
            </h2>
            <p>{event.soldOutThreshold} Tickets</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Event Impressions
            </h2>
            <p>{event.totalImpressions ?? 0} Views</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1 text-primary-text">
              Checkout Drop Off Rate
            </h2>
            <p>{event.dropOffRate}%</p>
          </div>
        </div>
      </ContainerWrapper>
      <div className="grid gap-4 mt-6 md:grid-cols-[1fr_357px]">
        <ContainerWrapper className="w-full h-auto">
          <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">
              Registrations
            </h2>
          </div>
          <RegistrationChart />
        </ContainerWrapper>
        <ContainerWrapper className="w-full h-auto">
          <div className="bg-[#D9EDFF]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">
              Ticket Sales
            </h2>
          </div>
          <TicketSalesChart />
        </ContainerWrapper>
      </div>
      <RegistrationTable />
    </div>
  );
}
