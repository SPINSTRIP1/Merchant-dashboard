"use client";
import {
  Calendar03Icon,
  Call02Icon,
  Globe02Icon,
  Location01Icon,
  Navigation03Icon,
  StarIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { formatDateDisplay } from "@/utils";
import ImpressionsStack from "@/app/(dashboard)/apps-tools/event-planner/_components/impressions-stack";
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import ContainerWrapper from "@/components/container-wrapper";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import CheckOutModal from "./_components/modals/checkout";
import { Event } from "@/app/(dashboard)/apps-tools/event-planner/_schemas";
import { useState } from "react";

export default function EventsPage() {
  const event: Event = {
    name: "2026 Tech Expo",
    images: [
      "/events/1.jpg",
      "/events/2.jpg",
      "/events/3.jpg",
      "/events/1.jpg",
      "/events/2.jpg",
    ],
    city: "San Francisco",
    state: "CA",
    startDate: "2024-09-15T09:00:00Z",
    totalImpressions: 1250,
    tagline: "ExpoHQ",
    overview: `
                Reshaping African Future Through Professional Counseling.
Whether you are a practicing counselor or you are acting in a counseling capacity in any way, this event is for you.

The Annual Professional Counselors & Therapists Conference is a professional event packed with amazing networking opportunities, cutting-edge insights, and career-boosting sessions. The conference is a yearly rejuvenating initiative, dedicated to helping counselors, therapists, psychotherapists, and everyone in the helping profession grow in professional development, personal wholeness, healthy relationships, counseling effectiveness, and professional networking among like-minded.

The Conference offers a rare and valuable venue for practitioners to Network and seek healthy refuge from the fast-paced lifestyles prevalent in contemporary society. At these relaxing and empowering retreats, counselors can nourish and revitalize bodies, minds, and psyches away from work, to attain or regain high levels of personal and professional wellness. It also offers opportunities for continuous professional development with enriching and educational conferences.

We shall be having trailblazers in the field of mental health and helping professionals from all over the world to lead our panels and speaking sessions. They shall be taking us through a professional ride on all the latest innovations, theories, interventions, and developments in the field of counseling and psychotherapy. 
    `,
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
  };
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <section>
      <MaxWidthWrapper className="space-y-4">
        <div className="w-full h-[560px]">
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
            <h2 className="text-sm lg:text-[58px] leading-[100%] text-black mt-5 font-medium">
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
                <p className="text-sm">{formatDateDisplay(event.startDate)}</p>
              </div>
              <ImpressionsStack impressions={event.totalImpressions ?? 0} />
            </div>
          </div>
          <div className="flex bg-primary-accent p-3 gap-x-5 items-center rounded-3xl">
            <div>
              <h2 className="font-bold text-primary-text">From ₦15,000</h2>
              <p>7:00 AM GMT, 21 August</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Reserve a Spot</Button>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-primary-text">Overview</h1>
          <p className="whitespace-pre-line">{event.overview}</p>
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
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
              <div>
                <p className="text-sm font-bold text-primary-text">Address</p>
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
                <p className="text-sm font-bold text-primary-text">Website</p>
                <p className="text-sm">www.lakowewebsite.com</p>
              </div>
            </div>
            <ChevronRight />
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
        </ContainerWrapper>
        <ContainerWrapper>
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-primary-text">Reviews(213K)</h1>
            <Link href={"/"} className="flex text-xs items-center gap-x-1">
              {" "}
              See More <ChevronRight size={16} />
            </Link>
          </div>
          <div className="mt-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="mb-3">
                <div className="flex items-center">
                  <Image
                    src={"/avatar.jpg"}
                    alt={"Reviewer"}
                    width={60}
                    height={60}
                    className="w-10 h-10 object-cover rounded-full"
                  />

                  <div className="ml-3">
                    <p className="font-bold text-primary-text">Jane Doe</p>
                    <div className="flex items-center gap-x-1">
                      <div className="flex items-center gap-x-0.5">
                        {[1, 2, 3, 4, 5].map((_, index) => (
                          <HugeiconsIcon
                            key={index}
                            icon={StarIcon}
                            size={14}
                            color={index < 4 ? "#9E76F8" : "#C8C8C8"}
                            fill={index < 4 ? "#9E76F8" : "#C8C8C8"}
                          />
                        ))}
                      </div>
                      <p className="text-sm">Jun 10, 2024</p>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-sm">
                  Amazing event! Had a great time learning and networking.
                  Highly recommend to anyone interested in tech.
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <h2 className="font-bold text-primary-text mb-1">
              Review this event
            </h2>
            <div className="flex items-center">
              <Image
                src={"/avatar.jpg"}
                alt={"Reviewer"}
                width={60}
                height={60}
                className="w-10 h-10 object-cover rounded-full"
              />

              <div className="flex items-center ml-3 gap-x-0.5">
                {[1, 2, 3, 4, 5].map((_, index) => (
                  <HugeiconsIcon
                    key={index}
                    icon={StarIcon}
                    size={20}
                    color={"#C8C8C8"}
                    fill={"#C8C8C8"}
                  />
                ))}
              </div>
            </div>
            <Textarea
              placeholder="Share your thoughts on this event..."
              className="bg-[#E0E0E0] border-none my-5"
              rows={6}
            />
            <Button>Submit</Button>
          </div>
        </ContainerWrapper>
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
      </MaxWidthWrapper>
      <CheckOutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
      />
    </section>
  );
}
