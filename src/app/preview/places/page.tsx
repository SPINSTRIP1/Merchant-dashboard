"use client";
import {
  Call02Icon,
  Globe02Icon,
  Location01Icon,
  Navigation03Icon,
  StarIcon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import ContainerWrapper from "@/components/container-wrapper";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
s;
import CheckOutModal from "./_components/modals/checkout";
import { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";
import { useState } from "react";
import { cn } from "@/lib/utils";
import FacilityCard from "@/app/(dashboard)/apps-tools/places/[id]/_components/facility-card";
import { PLACE_TYPES } from "@/app/(dashboard)/apps-tools/places/_constants";

export default function PlacesPage() {
  const event: Event = {
    name: "Radisson Blu Hotel - Ikeja",
    images: [
      "/places/1.jpg",
      "/places/2.png",
      "/places/3.png",
      "/places/4.png",
    ],
    city: "San Francisco",
    state: "CA",
    startDate: "2024-09-15T09:00:00Z",
    totalImpressions: 1250,
    tagline: "Radisson Blu",
    ticketTiers: [
      {
        id: "tier1",
        name: "Regular",
        description: "Access to all general sessions and exhibitions.",
        price: 15000,
        quantityAvailable: 100,
      },
      {
        id: "tier2",
        name: "VIP",
        description: "Access to all general sessions and exhibitions.",
        price: 30000,
        quantityAvailable: 50,
      },
      {
        id: "tier3",
        name: "Platinum",
        description: "Access to all general sessions and exhibitions.",
        price: 15000,
        quantityAvailable: 100,
      },
    ],
    overview: `
                Reshaping African Future Through Professional Counseling.
Whether you are a practicing counselor or you are acting in a counseling capacity in any way, this event is for you.

The Annual Professional Counselors & Therapists Conference is a professional event packed with amazing networking opportunities, cutting-edge insights, and career-boosting sessions. The conference is a yearly rejuvenating initiative, dedicated to helping counselors, therapists, psychotherapists, and everyone in the helping profession grow in professional development, personal wholeness, healthy relationships, counseling effectiveness, and professional networking among like-minded.

The Conference offers a rare and valuable venue for practitioners to Network and seek healthy refuge from the fast-paced lifestyles prevalent in contemporary society. At these relaxing and empowering retreats, counselors can nourish and revitalize bodies, minds, and psyches away from work, to attain or regain high levels of personal and professional wellness. It also offers opportunities for continuous professional development with enriching and educational conferences.

We shall be having trailblazers in the field of mental health and helping professionals from all over the world to lead our panels and speaking sessions. They shall be taking us through a professional ride on all the latest innovations, theories, interventions, and developments in the field of counseling and psychotherapy. 
    `,
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState<"home" | "about">("home");
  const facilities = [
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
    {
      name: "Conference Room A",
      description: "Spacious room with AV equipment",
      images: ["/places/2.png"],
      facilityCategory: "Conference Room",
      accessType: "Public",
      fees: [{ amount: 5000 }],
    },
  ];
  return (
    <section>
      <MaxWidthWrapper className="space-y-4">
        <div className="flex justify-between mb-5 items-center">
          <div className="flex items-center gap-x-2">
            <Image
              src={event?.images?.[0] || ""}
              alt={event.name}
              width={40}
              height={40}
              className="w-12 h-12 object-cover rounded-full"
            />
            <p className="text-lg text-primary-text">{event.tagline || ""}</p>
          </div>
          <div className="border-b">
            <button
              onClick={() => setPage("home")}
              className={cn(
                "px-4 md:px-5 text-base md:text-lg font-bold",
                page === "home"
                  ? "border-black text-primary-text border-b"
                  : "border-transparent text-neutral-accent",
              )}
            >
              Home
            </button>
            <button
              onClick={() => setPage("about")}
              className={cn(
                "px-4 md:px-5 text-base md:text-lg font-bold",
                page === "about"
                  ? "border-black text-primary-text border-b"
                  : "border-transparent text-neutral-accent",
              )}
            >
              About
            </button>
          </div>
          <div className="hidden md:block"></div>
        </div>
        <div className="w-full h-[220px] lg:h-[560px]">
          <Image
            src={event?.images?.[0] || ""}
            alt={event.name}
            width={1200}
            height={560}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base lg:text-[58px] leading-[100%] text-black md:mt-5 font-medium">
              {event.name}
            </h2>
            <div className="flex items-center my-2 gap-x-4">
              <div className="flex items-center gap-x-2">
                <Image
                  src={event?.images?.[0] || ""}
                  alt={event.name}
                  width={40}
                  height={40}
                  className="w-6 h-6 object-cover rounded-full"
                />
                <p className="text-lg text-primary-text">
                  {event.tagline || ""}
                </p>
              </div>
              <button className="flex items-center bg-primary gap-x-0.5 rounded-xl px-2.5 py-1.5">
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
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={24}
                  color="#6F6D6D"
                />
                <p className="text-sm">Lekki, Lagos</p>
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
          <div className="md:flex hidden bg-primary-accent p-3 gap-x-14 items-center rounded-3xl">
            <div>
              <h2 className="font-bold text-primary-text">From ₦200,000</h2>
              <p>Always Open</p>
            </div>
            <Button
              className="w-[187px] py-5"
              onClick={() => setIsModalOpen(true)}
            >
              Book
            </Button>
          </div>
        </div>
        {page === "home" ? (
          <>
            <div>
              <h1 className="font-bold text-primary-text">Facilities</h1>
              <div className="flex gap-2 mt-3 flex-wrap">
                {PLACE_TYPES.slice(0, 5).map((type) => (
                  <div
                    key={type.value}
                    className={cn(
                      "flex items-center cursor-pointer gap-x-1  rounded-full px-1 py-0.5 border ",
                      "bg-foreground border-secondary-text text-secondary-text",
                    )}
                  >
                    <HugeiconsIcon
                      icon={type.icon}
                      size={20}
                      color={"#6F6D6D"}
                    />
                    <span className="text-sm text-inherit">{type.label}</span>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-5">
                {facilities.map((facility, index) => (
                  <FacilityCard
                    key={index}
                    title={facility.name}
                    description={facility.description}
                    imgUrl={facility.images?.[0] || ""}
                    facilityType={facility.facilityCategory}
                    accessType={facility.accessType || "N/A"}
                    price={facility.fees?.[0]?.amount || 0}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="font-bold text-primary-text">Gallery</h1>
              <div className="flex gap-4 overflow-x-auto">
                {event.images?.map((image, index) => (
                  <div key={index} className="min-w-[253px] flex-1 h-[206px]">
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
            </div>

            <ContainerWrapper>
              <div className="flex mb-3 justify-between w-full items-center">
                <h2 className="font-bold text-primary-text">Posts</h2>
                <Link href={"/"} className="flex text-xs items-center gap-x-1">
                  See More <ChevronRight size={16} />
                </Link>
              </div>
              <div className="flex overflow-x-auto gap-x-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                  <div
                    key={item}
                    className="flex min-w-[168px] max-w-[168px] flex-col gap-y-2"
                  >
                    <Image
                      src={"/events/1.jpg"}
                      alt={"Post 1"}
                      width={400}
                      height={400}
                      className="rounded-lg w-full h-[206px] object-cover"
                    />

                    <p className="text-xs text-primary-text">
                      A day in my life as a lifestyle influencer in lagos
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-x-1">
                        <Image
                          src={"/avatar.jpg"}
                          alt={"Reviewer"}
                          width={60}
                          height={60}
                          className="w-5 h-5 object-cover rounded-full"
                        />
                        <p className="text-xxs">Jane Doe</p>
                      </div>

                      <div className="ml-3">
                        <div className="flex items-center gap-x-1">
                          <HugeiconsIcon
                            icon={StarIcon}
                            size={14}
                            color={"#9E76F8"}
                            fill={"#9E76F8"}
                          />

                          <p className="text-xxs">345 Likes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ContainerWrapper>
          </>
        ) : (
          <>
            <div>
              <h1 className="font-bold text-primary-text">Overview</h1>
              <p className="whitespace-pre-line">{event.overview}</p>
            </div>

            <ContainerWrapper>
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon
                    icon={Location01Icon}
                    size={24}
                    color="#6F6D6D"
                  />
                  <div>
                    <p className="text-sm font-bold text-primary-text">
                      Address
                    </p>
                    <p className="text-sm">1132, Lekki, Lagos, Nigeria</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon icon={Call02Icon} size={24} color="#6F6D6D" />
                  <div>
                    <p className="text-sm font-bold text-primary-text">Call</p>
                    <p className="text-sm">08001233211</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon icon={Globe02Icon} size={24} color="#6F6D6D" />
                  <div>
                    <p className="text-sm font-bold text-primary-text">
                      Website
                    </p>
                    <p className="text-sm">www.lakowewebsite.com</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
            </ContainerWrapper>
            <ContainerWrapper>
              <div className="flex items-center mb-4 justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-bold text-primary-text">
                      Afrochella Global
                    </p>
                    <div className="flex items-center gap-x-1">
                      <div className="flex items-center gap-x-0.5">
                        <HugeiconsIcon
                          icon={StarIcon}
                          size={14}
                          color="#9E76F8"
                          fill="#9E76F8"
                        />
                        <span className="text-sm font-bold text-primary-text">
                          3
                        </span>
                      </div>
                      <p className="text-sm">on SpinStrip (2134 reviews)</p>
                    </div>
                    <p className="text-sm">Media/Entertainment Company</p>
                  </div>

                  <div className="flex items-center gap-x-2">
                    <div>
                      <p className="text-sm font-bold text-primary-text">
                        About 54.7 KM from you
                      </p>
                      <p className="text-sm">1132, Lekki, Lagos, Nigeria</p>
                    </div>
                  </div>
                  <Button variant={"secondary"} className="px-3 py-px">
                    Suggest Edit
                  </Button>
                </div>
                <div className="bg-primary-accent rounded-full p-3">
                  <HugeiconsIcon
                    icon={Navigation03Icon}
                    size={24}
                    color="#6932E2"
                  />
                </div>
              </div>
              <div className="w-full border rounded-lg overflow-hidden border-neutral-accent flex-1 h-[183px]">
                <Image
                  src={"/map.png"}
                  alt={event.name}
                  width={1200}
                  height={800}
                  className="w-full h-full object-cover"
                />
              </div>
            </ContainerWrapper>
          </>
        )}

        <div className="flex md:hidden bg-primary-accent justify-between p-3 items-center rounded-3xl">
          <div>
            <h2 className="font-bold text-primary-text">From ₦200,000</h2>
            <p>Always Open</p>
          </div>
          <Button
            className="w-[150px] py-5"
            onClick={() => setIsModalOpen(true)}
          >
            Book
          </Button>
        </div>
      </MaxWidthWrapper>
      <CheckOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        place={event}
      />
    </section>
  );
}
