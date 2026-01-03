import ContainerWrapper from "@/components/container-wrapper";
import React from "react";
import { Globe02Icon, Time01Icon } from "@hugeicons/core-free-icons";
import {
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import FacilityCard from "./facility-card";
import AddButton from "@/app/(dashboard)/_components/add-button";
import FacilityModal from "./modals/facility-modal";
import { PLACE_TYPES } from "../../_constants";
import EmptyState from "@/components/empty-state";
import { SinglePlace } from "../../_components/claim-places-steps/find-place";
import { useQuery } from "@tanstack/react-query";
import { Facility } from "../../_schemas";
import { PLACES_SERVER_URL } from "@/constants";
import api from "@/lib/api/axios-client";
import Loader from "@/components/loader";

export default function FacilityManagement({
  place,
}: {
  place: SinglePlace | undefined;
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const placeType = PLACE_TYPES.find(
    (type) => type.value === place?.placeType
  )?.label;
  const { data, isLoading } = useQuery<Facility[]>({
    queryKey: ["place-facility", place?.id],
    queryFn: async () => {
      try {
        const response = await api.get(
          PLACES_SERVER_URL + `/places/${place?.id}/facilities`
        );
        return response.data.data.facilities;
      } catch (error) {
        console.log("Error fetching facilities:", error);
        return [];
      }
    },
  });
  if (!place) {
    return <p className="text-center text-primary-text">Place not found.</p>;
  }
  return (
    <>
      <div className="text-sm flex flex-col items-end justify-end space-y-5">
        <AddButton title="Add Facility" onClick={() => setIsModalOpen(true)} />
        <ContainerWrapper className="space-y-3 w-full">
          <div>
            <h1 className="text-2xl font-bold text-primary-text">
              {place.name} - {place.city}
            </h1>
            <p className="text-base text-primary-text">{placeType}</p>
          </div>
          <Image
            src={place.coverImage || ""}
            alt={place.name}
            width={960}
            height={650}
            className="w-full h-[206px] object-cover object-center rounded-xl"
          />
          <p>{place.description}</p>
          <div className="flex items-center justify-between gap-x-2 my-3">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
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
              <p className="text-sm">{place.website || "N/A"}</p>
            </div>

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
              {/* <div className="border-2 rounded-full -ml-1 overflow-hidden border-white">
                <Image
                  src={"/avatars/4.jpg"}
                  alt={"avatar"}
                  width={40}
                  height={40}
                  className="w-5 h-5 object-cover"
                />
              </div> */}
              <div className="bg-background-light rounded-3xl px-1.5 py-1">
                <p className="text-[10px] text-secondary-text uppercase">
                  +10 others
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-between my-4 w-full">
            <button className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2">
              <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
              <p className="font-normal text-sm">Edit</p>
            </button>

            <button className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2">
              <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
              <p className="font-normal text-sm">Delete</p>
            </button>
          </div>
          <div className="text-sm mt-4 pt-4">
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">Amenities</h2>
              <div className="flex items-end max-w-sm justify-end flex-wrap gap-2">
                {place.metadata?.amenities.split(",").map((item) => (
                  <div
                    key={item}
                    className="border border-neutral-accent rounded-xl w-fit py-0.5 px-1"
                  >
                    <p className="text-sm text-secondary-text">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">Visibility</h2>
              <p>Public</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">
                Check out time
              </h2>
              <p>12 noon daily</p>
            </div>{" "}
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">
                Opening hours (regular + special days)
              </h2>
              <p>24 Hours</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">
                Contact Phone
              </h2>
              <p>{place?.phoneNumbers?.[0] || "N/A"}</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">
                Contact Email
              </h2>
              <p>{place?.emails?.[0] || "N/A"}</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">Location</h2>
              <p>{place?.address || "N/A"}</p>
            </div>
          </div>
        </ContainerWrapper>
        <ContainerWrapper className="w-full h-fit">
          <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">Facilities</h2>
          </div>
          {isLoading ? (
            <Loader />
          ) : data && data.length > 0 ? (
            <div className="grid grid-cols-3 gap-10 mt-5">
              {data?.map((facility, index) => (
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
          ) : (
            <EmptyState
              // icon={<MapPin className="h-16 w-16 text-primary" />}
              title="No Facilities"
              description={"No facilities available for this place yet"}
            />
          )}
        </ContainerWrapper>
      </div>
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        placeId={place.id!}
      />
    </>
  );
}
