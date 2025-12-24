import {
  Calendar03Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { Event } from "../../../event-planner/_components/events-table";

export default function ActivitiesExperience({
  title,
  events,
}: {
  title: string;
  events: Event[];
}) {
  return (
    <div className="w-full overflow-x-hidden mt-7 max-w-[calc(100vw-180px)]">
      <h1 className="font-bold text-primary-text mb-4">{title}</h1>
      <div className="flex overflow-x-auto pb-4 w-[90%] 2xl:w-full gap-4">
        {[...events, ...events].map((event, index) => (
          <div
            key={index}
            className="flex flex-col gap-y-2 min-w-[348px] max-w-[348px] w-full"
          >
            <div className="w-full h-[206px]">
              <Image
                src={event.imgUrl}
                alt={event.title}
                width={400}
                height={600}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
            <h2 className="text-sm lg:text-base font-bold">{event.title}</h2>
            <div className="flex items-center gap-x-2">
              <Image
                src={event.imgUrl}
                alt={event.title}
                width={40}
                height={40}
                className="w-5 h-5 object-cover rounded-full"
              />
              <p className="text-sm">{event.tagline}</p>
            </div>
            <div className="flex items-center gap-x-2">
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon
                  icon={Location01Icon}
                  size={24}
                  color="#6F6D6D"
                />
                <p className="text-sm">{event.location}</p>
              </div>
              <div className="flex items-center gap-x-2">
                <HugeiconsIcon
                  icon={Calendar03Icon}
                  size={24}
                  color="#6F6D6D"
                />
                <p className="text-sm">{event.date}</p>
              </div>
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
            <div className="flex justify-between w-full">
              <button className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2">
                <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
                <p className="font-normal text-sm">Edit</p>
              </button>

              <button className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2">
                <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
                <p className="font-normal text-sm">Delete</p>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
