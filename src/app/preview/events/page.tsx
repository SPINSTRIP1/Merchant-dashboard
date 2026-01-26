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
import { useEffect, useState } from "react";
import EmptyState from "@/components/empty-state";
import { useSearchParams } from "next/navigation";
import { SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import Loader from "@/components/loader";

interface TicketTier {
  id: string;
  name: string;
  description: string;
  price: number;
  quantityAvailable: number;
}

export interface PublicEvent {
  id: string;
  name: string;
  description: string;
  city: string;
  state: string;
  country: string;
  location: string;
  contactEmail: string;
  contactPhone: string;
  startDate: string;
  endDate: string;
  timezone: string;
  frequency: "ONE_OFF" | "RECURRING";
  recurringPattern: string | null;
  customRecurrenceDays: number | null;
  images: string[];
  videos: string[] | null;
  expectedGuests: number;
  soldOutThreshold: number;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  isFeatured: boolean;
  impressions: number;
  totalImpressions: number;
  totalRegistrations: number;
  ticketTiers: TicketTier[];
  userId: string;
  placeId: string | null;
  dealId: string | null;
  formId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export default function EventsPage() {
  const posts: string[] = [];
  const reviews: string[] = [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const id = useSearchParams().get("id");
  const [event, setEvent] = useState<PublicEvent | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await api.get(SERVER_URL + `/events/public/${id}`);
        return response.data.data;
      } catch (error) {
        console.log("Error fetching products:", error);
        return null;
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent().then((data) => setEvent(data));
    }
  }, [id]);

  if (loading) return <Loader />;
  if (!event) return <p>No event found.</p>;
  console.log(event);
  return (
    <section>
      <MaxWidthWrapper className="space-y-4">
        <div className="w-full h-[560px]">
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
            <h2 className="text-sm lg:text-[58px] leading-[100%] text-black mt-5 font-medium">
              {event.name}
            </h2>

            <button className="flex mb-3 mt-2 items-center bg-primary gap-x-0.5 rounded-xl px-2.5 py-1.5">
              <Image
                src={"/logo-mark.svg"}
                alt={event.name}
                width={40}
                height={40}
                className="w-5 h-5 object-contain"
              />
              <p className="text-sm text-white">Follow</p>
            </button>

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
              <h2 className="font-bold text-primary-text">
                {event.ticketTiers.length > 0
                  ? `From ₦${Math.min(...event.ticketTiers.map((t) => t.price)).toLocaleString()}`
                  : "Free"}
              </h2>
              <p>
                {new Date(event.startDate).toLocaleString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                  timeZoneName: "short",
                  day: "numeric",
                  month: "long",
                })}
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Reserve a Spot</Button>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-primary-text">Overview</h1>
          <p className="whitespace-pre-line">{event.description}</p>
        </div>
        <div className="space-y-4">
          <h1 className="font-bold text-primary-text">Gallery</h1>
          <div className="flex gap-4 overflow-x-auto">
            {event.images?.map((image, index) => (
              <div
                key={index}
                className="min-w-[253px]  max-w-[253px] flex-1 h-[206px]"
              >
                <img
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
                <p className="text-sm">
                  {event.location}, {event.city}, {event.state}, {event.country}
                </p>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon icon={Call02Icon} size={24} color="#6F6D6D" />
              <div>
                <p className="text-sm font-bold text-primary-text">Call</p>
                <p className="text-sm">{event.contactPhone}</p>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div className="flex items-center mb-4 justify-between">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon icon={Globe02Icon} size={24} color="#6F6D6D" />
              <div>
                <p className="text-sm font-bold text-primary-text">Email</p>
                <p className="text-sm">{event.contactEmail}</p>
              </div>
            </div>
            <ChevronRight />
          </div>
          <div className="w-full border rounded-lg overflow-hidden border-neutral-accent flex-1 h-[183px]">
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(`${event.location}, ${event.city}, ${event.state}, ${event.country}`)}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
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
            <h1 className="font-bold text-primary-text">
              Reviews({reviews.length})
            </h1>
            <Link href={"/"} className="flex text-xs items-center gap-x-1">
              {" "}
              See More <ChevronRight size={16} />
            </Link>
          </div>
          <div className="mt-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((item, i) => (
                <div key={i} className="mb-3">
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
              ))
            ) : (
              <EmptyState
                icon={
                  <HugeiconsIcon icon={StarIcon} size={32} color="#6932E2" />
                }
                title="No Reviews Yet"
                description="Be the first to share your experience at this event."
              />
            )}
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
            {posts && posts.length > 0 ? (
              posts.map((item, i) => (
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
              ))
            ) : (
              <EmptyState
                icon={
                  <HugeiconsIcon
                    icon={Calendar03Icon}
                    size={32}
                    color="#6932E2"
                  />
                }
                title="No Posts Yet"
                description="There are no posts related to this event at the moment."
              />
            )}
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
