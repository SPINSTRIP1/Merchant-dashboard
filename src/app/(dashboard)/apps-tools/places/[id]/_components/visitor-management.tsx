// import ContainerWrapper from "@/components/container-wrapper";
// import React from "react";
// import FacilityCard from "./facility-card";
import VisitorList from "./visitor-list";
// import RoomInventory from "./room-inventory";

export default function VisitorManagement() {
  return (
    <VisitorList />
    // <div className="text-sm">
    //   <VisitorList />
    //   <ContainerWrapper className="w-full h-fit">
    //     <div className="bg-[#F6E9DD]  py-3 px-3 rounded-2xl">
    //       <h2 className="font-bold text-lg text-primary-text">Room Types</h2>
    //     </div>
    //     <div className="grid grid-cols-3 gap-10 mt-5">
    //       {[
    //         {
    //           title: "Deluxe Room",
    //           imgUrl: "/places/1.jpg",
    //           description:
    //             "Standard suite with the best amenities and serene comfort ",
    //           maxOccupancy: 3,
    //           bedSize: "King Size",
    //           pricePerNight: 250,
    //           amenities: ["Pool", "Gym", "Sauna"],
    //         },
    //         {
    //           title: "Deluxe Room",
    //           imgUrl: "/places/2.png",
    //           description:
    //             "Standard suite with the best amenities and serene comfort ",
    //           maxOccupancy: 3,
    //           bedSize: "King Size",
    //           pricePerNight: 250,
    //           amenities: ["Pool", "Gym", "Sauna"],
    //         },
    //         {
    //           title: "Deluxe Room",
    //           imgUrl: "/places/3.png",
    //           description:
    //             "Standard suite with the best amenities and serene comfort ",
    //           maxOccupancy: 3,
    //           bedSize: "King Size",
    //           pricePerNight: 250,
    //           amenities: ["Pool", "Gym", "Sauna"],
    //         },
    //       ].map((facility, index) => (
    //         <FacilityCard key={index} {...facility} />
    //       ))}
    //     </div>
    //   </ContainerWrapper>
    //   <RoomInventory />
    // </div>
  );
}
