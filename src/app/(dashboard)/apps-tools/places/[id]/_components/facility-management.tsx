import ContainerWrapper from "@/components/container-wrapper";
import React from "react";
import ImageGallery from "./image-gallery";
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

export default function FacilityManagement() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  return (
    <>
      <div className="text-sm flex flex-col items-end justify-end space-y-5">
        <AddButton title="Add Facility" onClick={() => setIsModalOpen(true)} />
        <ContainerWrapper className="space-y-3">
          <div>
            <h1 className="text-2xl font-bold text-primary-text">
              Radisson Blu Hotels - Ikeha
            </h1>
            <p className="text-base text-primary-text">Hotel</p>
          </div>
          <ImageGallery
            images={[
              "/places/1.jpg",
              "/places/2.png",
              "/places/3.png",
              "/places/4.png",
              "/places/4.png",
            ]}
          />
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Rem qui
            repellendus cum libero, ut laborum iusto, voluptatibus beatae
            commodi quisquam esse optio, magni neque corrupti ex in sunt non
            temporibus!
          </p>
          <div className="flex items-center justify-between gap-x-2 my-3">
            <div className="flex items-center gap-x-2">
              <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
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
              <div className="bg-background-light rounded-3xl px-1.5 py-1">
                <p className="text-[10px] text-secondary-text uppercase">
                  +24k others
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
                {[
                  "Pool",
                  "Gym",
                  "Sauna",
                  "Spa",
                  "Conference Hall",
                  "Airport Pickup",
                  "Restaurant & Bar",
                ].map((item) => (
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
              <p>08102345060</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">
                Contact Email
              </h2>
              <p>contact@example.com</p>
            </div>
            <div className="flex items-center justify-between my-2 w-full">
              <h2 className="font-bold mb-1 text-primary-text">Location</h2>
              <p>112, Lekki, Lagos.</p>
            </div>
          </div>
        </ContainerWrapper>
        <ContainerWrapper className="w-full h-fit">
          <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
            <h2 className="font-bold text-lg text-primary-text">Facilities</h2>
          </div>
          <div className="grid grid-cols-3 gap-10 mt-5">
            {[
              {
                title: "Deluxe Room",
                imgUrl: "/places/1.jpg",
                description:
                  "Standard suite with the best amenities and serene comfort ",
                maxOccupancy: 3,
                bedSize: "King Size",
                pricePerNight: 250,
                amenities: ["Pool", "Gym", "Sauna"],
              },
              {
                title: "Deluxe Room",
                imgUrl: "/places/2.png",
                description:
                  "Standard suite with the best amenities and serene comfort ",
                maxOccupancy: 3,
                bedSize: "King Size",
                pricePerNight: 250,
                amenities: ["Pool", "Gym", "Sauna"],
              },
              {
                title: "Deluxe Room",
                imgUrl: "/places/3.png",
                description:
                  "Standard suite with the best amenities and serene comfort ",
                maxOccupancy: 3,
                bedSize: "King Size",
                pricePerNight: 250,
                amenities: ["Pool", "Gym", "Sauna"],
              },
            ].map((facility, index) => (
              <FacilityCard key={index} {...facility} />
            ))}
          </div>
        </ContainerWrapper>
      </div>
      <FacilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
