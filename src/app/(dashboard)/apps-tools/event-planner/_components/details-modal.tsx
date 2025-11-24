import { File01Icon, Time01Icon } from "@hugeicons/core-free-icons";
import {
  Calendar03Icon,
  Chart03Icon,
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function DetailsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground scrollbar-hide rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <div className="flex w-full mb-4 justify-between items-center">
          <h1 className="font-bold text-2xl text-primary-text">
            Afrochella 2025
          </h1>
          <button
            onClick={onClose}
            className="min-w-6 min-h-6 max-h-6 max-w-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <X size={20} className="text-secondary-text" />
          </button>
        </div>
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
        <div className="flex justify-between my-4 w-full">
          <div className="flex items-center gap-x-2">
            <button className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2">
              <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
              <p className="font-normal text-sm">Edit</p>
            </button>

            <Link href={"/apps-tools/event-planner/sales-registrations"}>
              <div className="rounded-2xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2">
                <HugeiconsIcon icon={Chart03Icon} color="#6932E2" size={16} />
                <p className="font-normal text-sm">Sales and Registrations</p>
              </div>
            </Link>

            <button className="rounded-2xl text-primary bg-primary-accent h-[35px] px-2 flex justify-center items-center gap-2">
              <HugeiconsIcon icon={File01Icon} color="#6932E2" size={16} />
              <p className="font-normal text-sm">Form Builder</p>
            </button>
          </div>

          <button className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2">
            <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
            <p className="font-normal text-sm">Delete</p>
          </button>
        </div>
        <div className="border-t text-sm mt-8 pt-4">
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Status</h2>
            <div className="border border-[#34C759] rounded-3xl px-1 py-0.5 text-[#34C759] bg-[#DDF6E2]">
              <p>Upcoming</p>
            </div>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Menu Items</h2>
            <div className="flex items-end justify-end flex-wrap gap-2">
              {["Regular N15,000", "VIP N30,000", "Platinum N100,000"].map(
                (item) => (
                  <div
                    key={item}
                    className="border border-neutral-accent rounded-xl w-fit py-0.5 px-1"
                  >
                    <p className="text-sm text-secondary-text">{item}</p>
                  </div>
                )
              )}
            </div>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Visibility</h2>
            <p>Public</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Validity Period</h2>
            <p>15 Jan 2025 - 31 Dec 2025</p>
          </div>{" "}
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Sold Out Threshold</h2>
            <p>500 Tickets</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Contact Phone</h2>
            <p>08102345060</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Contact Email</h2>
            <p>contact@example.com</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Location</h2>
            <p>112, Lekki, Lagos.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
