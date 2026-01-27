"use client";
import {
  Calendar03Icon,
  Call02Icon,
  Globe02Icon,
  Location01Icon,
  // Navigation03Icon,
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
import CheckOutModal from "./_components/modals/checkout";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import FacilityCard from "@/app/(dashboard)/apps-tools/places/[id]/_components/facility-card";
import { PLACE_TYPES } from "@/app/(dashboard)/apps-tools/places/_constants";
import Loader from "@/components/loader";
import { SERVER_URL } from "@/constants";
import { useSearchParams } from "next/navigation";
import { Place } from "@/app/(dashboard)/apps-tools/places/_schemas";
import axios from "axios";
import EmptyState from "@/components/empty-state";
import { getOperatingHoursDisplay } from "@/app/(dashboard)/apps-tools/places/_utils";

export interface PublicPlace extends Omit<Place, "coverImage"> {
  coverImage: string;
  images: string[];
}

export default function PlacesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState<"home" | "about">("home");
  const id = useSearchParams().get("id");
  const [place, setPlace] = useState<PublicPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const posts: string[] = [];

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const response = await axios.get(SERVER_URL + `/places/public/${id}`);
        return response.data.data;
      } catch (error) {
        console.log("Error fetching products:", error);
        return null;
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent().then((data) => setPlace(data));
    }
  }, [id]);
  const placeTypes = place?.facilities?.map((facility) =>
    PLACE_TYPES.find((type) => type.label === facility.facilityCategory),
  );
  if (loading) return <Loader />;
  if (!place) return <p>No place found.</p>;
  console.log(place);
  return (
    <section>
      <MaxWidthWrapper className="space-y-4">
        <div className="flex justify-between mb-5 items-center">
          <div className="flex items-center gap-x-2">
            <Image
              src={place?.coverImage || ""}
              alt={place.name}
              width={40}
              height={40}
              className="w-12 h-12 object-cover rounded-full"
            />
            <p className="text-lg text-primary-text">{place.name || ""}</p>
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
            src={place?.coverImage || ""}
            alt={place.name}
            width={1200}
            height={560}
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base lg:text-[58px] leading-[100%] text-black md:mt-5 font-medium">
              {place.name}
            </h2>

            <button className="flex items-center my-2 bg-primary gap-x-0.5 rounded-xl px-2.5 py-1.5">
              <Image
                src={"/logo-mark.svg"}
                alt={place.name}
                width={40}
                height={40}
                className="w-5 h-5 object-contain"
              />
              <p className="text-sm text-white">Follow</p>
            </button>

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
                {getOperatingHoursDisplay(place.operatingHours)}
              </div>
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon icon={Globe02Icon} size={24} color="#6F6D6D" />
                <p className="text-sm">
                  {place.website || "www.reallygreatsite.com"}
                </p>
              </div>
            </div>
          </div>
          {/* <div className="md:flex hidden bg-primary-accent p-3 gap-x-14 items-center rounded-3xl">
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
          </div> */}
        </div>
        {page === "home" ? (
          <>
            <div>
              <h1 className="font-bold text-primary-text">Facilities</h1>
              <div className="flex gap-2 mt-3 flex-wrap">
                {placeTypes?.map((type, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex items-center cursor-pointer gap-x-1  rounded-full px-1 py-0.5 border ",
                      "bg-foreground border-secondary-text text-secondary-text",
                    )}
                  >
                    <HugeiconsIcon
                      icon={type?.icon || StarIcon}
                      size={20}
                      color={"#6F6D6D"}
                    />
                    <span className="text-sm text-inherit">{type?.label}</span>
                  </div>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 mt-5">
                {place?.facilities?.map((facility, index) => (
                  <FacilityCard
                    key={index}
                    title={facility.name}
                    description={facility.description}
                    imgUrl={facility.images?.[0] || ""}
                    facilityType={facility.facilityCategory}
                    accessType={facility.accessType || "N/A"}
                    price={facility.fees?.[0]?.amount || 0}
                    onClick={() => setIsModalOpen(true)}
                  />
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h1 className="font-bold text-primary-text">Gallery</h1>
              <div className="flex gap-4 overflow-x-auto">
                {place?.images?.map((image, index) => (
                  <div key={index} className="min-w-[253px] flex-1 h-[206px]">
                    <Image
                      src={image}
                      alt={place.name}
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
                {posts && posts.length > 0 ? (
                  posts.map((_, i) => (
                    <div
                      key={i}
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
          </>
        ) : (
          <>
            <div>
              <h1 className="font-bold text-primary-text">Overview</h1>
              <p className="whitespace-pre-line">{place.description}</p>
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
                    <p className="text-sm">{place.address}</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
              <div className="flex items-center mb-4 justify-between">
                <div className="flex items-center gap-x-2">
                  <HugeiconsIcon icon={Call02Icon} size={24} color="#6F6D6D" />
                  <div>
                    <p className="text-sm font-bold text-primary-text">Call</p>
                    <p className="text-sm">{place.phoneNumbers.join(", ")}</p>
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
                    <p className="text-sm">{place.website}</p>
                  </div>
                </div>
                <ChevronRight />
              </div>
            </ContainerWrapper>
            {/* <ContainerWrapper>
              <div className="flex items-center mb-4 justify-between">
                <div className="space-y-3">
                  <div>
                    <p className="text-lg font-bold text-primary-text">
                      {place.name}
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
            <iframe
              src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(place.address)}`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
            </ContainerWrapper> */}
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
        place={place}
      />
    </section>
  );
}
