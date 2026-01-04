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
import { Event } from "../_schemas";
import { formatAmount, formatDateDisplay } from "@/utils";
import { extractTimeFromDateTime } from "../_utils";
import ImpressionsStack from "./impressions-stack";

export default function DetailsModal({
  isOpen,
  onClose,
  event,
}: {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}) {
  if (!isOpen || !event) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={
          "bg-foreground scrollbar-hide rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <div className="flex w-full mb-4 justify-between items-center">
          <h1 className="font-bold text-2xl text-primary-text">{event.name}</h1>
          <button
            onClick={onClose}
            className="min-w-6 min-h-6 max-h-6 max-w-6 flex items-center justify-center bg-neutral-accent rounded-full hover:bg-gray-200 transition-colors duration-200"
          >
            <X size={20} className="text-secondary-text" />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {event.images?.map((image, index) => (
            <div key={index} className="w-[250px] h-[206px]">
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
        <p className="my-3">{event.description}</p>
        <div className="flex items-center justify-between gap-x-2 my-3">
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">
              {event.city}, {event.state}
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Time01Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">
              {extractTimeFromDateTime(event.startDate)} {event.timezone}
            </p>
          </div>
          <div className="flex items-center gap-x-2">
            <HugeiconsIcon icon={Calendar03Icon} size={24} color="#6F6D6D" />
            <p className="text-sm">{formatDateDisplay(event.endDate)}</p>
          </div>

          <ImpressionsStack impressions={event.totalImpressions ?? 0} />
        </div>
        <div className="flex justify-between my-4 w-full">
          <div className="flex items-center gap-x-2">
            <button className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2">
              <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
              <p className="font-normal text-sm">Edit</p>
            </button>

            <Link
              href={`/apps-tools/event-planner/sales-registrations?id=${event.id}`}
            >
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
            <div
              className={`border rounded-3xl px-1 py-0.5 ${
                event.status === "ACTIVE"
                  ? "border-[#34C759] text-[#34C759] bg-[#DDF6E2]"
                  : event.status === "INACTIVE"
                  ? "border-[#FF383C] text-[#FF383C] bg-[#F6DDDD]"
                  : "border-[#F5A623] text-[#F5A623] bg-[#FEF3DC]"
              }`}
            >
              <p>{event.status}</p>
            </div>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Tickets</h2>
            <div className="flex items-end justify-end flex-wrap gap-2">
              {event?.ticketTiers?.map((item) => (
                <div
                  key={item.name}
                  className="border border-neutral-accent rounded-xl w-fit py-0.5 px-1"
                >
                  <p className="text-sm text-secondary-text">
                    {item.name} {formatAmount(item.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Visibility</h2>
            <p>Public</p>
          </div> */}
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Validity Period</h2>
            <p>
              {formatDateDisplay(event.startDate)} -{" "}
              {formatDateDisplay(event.endDate)}
            </p>
          </div>{" "}
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Sold Out Threshold</h2>
            <p>{event.soldOutThreshold} Tickets</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Contact Phone</h2>
            <p>{event.contactPhone}</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Contact Email</h2>
            <p>{event.contactEmail}</p>
          </div>
          <div className="flex items-center justify-between my-2 w-full">
            <h2 className="font-bold mb-1">Location</h2>
            <p>{event.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
