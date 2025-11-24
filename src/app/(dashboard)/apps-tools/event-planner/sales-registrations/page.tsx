"use client";
import ContainerWrapper from "@/components/container-wrapper";
import { Time01Icon } from "@hugeicons/core-free-icons";
import { Calendar03Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import RegistrationChart from "./_components/registration-chart";
import RegistrationTable from "./_components/table";
import TicketSalesChart from "./_components/ticket-sales-chart";

export default function SalesAndRegistration() {
  return (
    <div>
      <h1 className="font-bold text-2xl text-primary-text">Afrochella 2025</h1>

      <div className="flex gap-4">
        <div className="w-full min-w-[253px] h-[206px]">
          <Image
            src={"/events/2.jpg"}
            alt={"Afrochella 2025"}
            width={400}
            height={600}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="w-full min-w-[253px] h-[206px]">
          <Image
            src={"/events/2.jpg"}
            alt={"Afrochella 2025"}
            width={400}
            height={600}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="w-full min-w-[253px] h-[206px]">
          <Image
            src={"/events/2.jpg"}
            alt={"Afrochella 2025"}
            width={400}
            height={600}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </div>
      <p className="my-3">
        Africa’s biggest cultural celebration is here! Experience live music,
        fashion, food, and art in one electrifying festival. The sound, the
        style, the soul of Africa — all on one stage.
      </p>
      <div className="flex items-center justify-between gap-x-2 my-3">
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">Lekki, Lagos</p>
        </div>
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Time01Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">20:00 (GMT+1)</p>
        </div>
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Calendar03Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">21 August, 2025</p>
        </div>

        <div className="flex items-center gap-x-2">
          <div className="flex items-center">
            <div className="border-2 rounded-full overflow-hidden border-white">
              <Image
                src={"/avatars/1.jpg"}
                alt={"avatar"}
                width={40}
                height={40}
                className="w-5 h-5 object-cover"
              />
            </div>
            <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
              <Image
                src={"/avatars/2.jpg"}
                alt={"avatar"}
                width={40}
                height={40}
                className="w-5 h-5 object-cover"
              />
            </div>
            <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
              <Image
                src={"/avatars/3.jpg"}
                alt={"avatar"}
                width={40}
                height={40}
                className="w-5 h-5 object-cover"
              />
            </div>
            <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
              <Image
                src={"/avatars/4.jpg"}
                alt={"avatar"}
                width={40}
                height={40}
                className="w-5 h-5 object-cover"
              />
            </div>
          </div>
          <div className="bg-background-light rounded-3xl px-1.5 py-1">
            <p className="text-[10px] text-secondary-text uppercase">
              +24k others
            </p>
          </div>
        </div>
      </div>

      <div className="text-sm mt-5">
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Total Registrations
          </h2>
          <p>450</p>
        </div>
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Total Tickets Sales
          </h2>
          <p>375</p>
        </div>
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Total Ticket Sales Via Deal
          </h2>
          <p>121</p>
        </div>{" "}
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Sold Out Threshold
          </h2>
          <p>500 Tickets</p>
        </div>
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Event Impressions
          </h2>
          <p>4300 Views</p>
        </div>
        <div className="flex items-center justify-between my-2 w-full">
          <h2 className="font-bold mb-1 text-primary-text">
            Checkout Drop Off Rate
          </h2>
          <p>15%</p>
        </div>
      </div>
      <div className="grid gap-4 mt-6 grid-cols-[1fr_357px]">
        <ContainerWrapper className="w-full h-fit">
          <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">
              Poor Performing Deals
            </h2>
          </div>
          <RegistrationChart />
        </ContainerWrapper>
        <ContainerWrapper className="w-full h-fit">
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
