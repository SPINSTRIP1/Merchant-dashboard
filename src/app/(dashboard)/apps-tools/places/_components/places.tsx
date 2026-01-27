import ContainerWrapper from "@/components/container-wrapper";
import React from "react";
import {
  ArrowRight02Icon,
  Globe02Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import {
  Delete02Icon,
  Edit02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import AddButton from "@/app/(dashboard)/_components/add-button";
import StatusBadge from "@/components/status-badge";
import { cn } from "@/lib/utils";
import { PLACE_TYPES } from "../_constants";
import Link from "next/link";
import { SinglePlace } from "./claim-places-steps/find-place";
import ImpressionsStack from "../../event-planner/_components/impressions-stack";
import { getOperatingHoursDisplay } from "../_utils";

interface PlaceProps {
  place: SinglePlace;
  onEdit?: (place: SinglePlace) => void;
  onDelete?: (place: SinglePlace) => void;
}

const Place = ({ place, onEdit, onDelete }: PlaceProps) => {
  const status = place.status || "UNVERIFIED";
  const placeType = PLACE_TYPES.find(
    (type) => type.value === place.placeType,
  )?.label;
  console.log(place);
  return (
    <div className="border-b last:border-0 last:pb-2 space-y-2 pt-3 pb-5 border-neutral-accent">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-primary-text">
            {place.name} - {place.city}
          </h1>
          <p className="text-base text-primary-text">{placeType}</p>
        </div>
        <Link
          href={`/apps-tools/places/${place.id}`}
          className="text-sm text-primary underline"
        >
          View Place
        </Link>
      </div>
      <Image
        src={place.coverImage || ""}
        alt={place.name}
        width={960}
        height={650}
        className="w-full h-[206px] object-cover object-center rounded-xl"
      />

      <p>{place.description}</p>
      <div className="flex items-center flex-wrap justify-between gap-3 my-3">
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Location01Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">
            {place.city}, {place.state}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Time01Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">
            {getOperatingHoursDisplay(place.operatingHours)}
          </p>
        </div>
        <div className="flex items-center gap-x-2">
          <HugeiconsIcon icon={Globe02Icon} size={24} color="#6F6D6D" />
          <p className="text-sm">{place.website || "N/A"}</p>
        </div>

        <ImpressionsStack impressions={place.views ?? 0} />
      </div>
      <div className="flex justify-between pt-3 w-full">
        <button
          onClick={() =>
            onEdit?.({
              ...place,
              // @ts-expect-error - URL strings are passed instead of File objects for editing
              environmentalSafetyPolicy:
                place.environmentalSafetyPolicyUrl || undefined,
              // @ts-expect-error - URL strings are passed instead of File objects for editing
              privacyPolicy: place.privacyPolicyUrl || undefined,
              // @ts-expect-error - URL strings are passed instead of File objects for editing
              disclaimers: place.disclaimersUrl || undefined,
              // @ts-expect-error - URL strings are passed instead of File objects for editing
              ownershipDocument: place.ownershipDocumentUrl || undefined,
              // @ts-expect-error - URL strings are passed instead of File objects for editing
              ownershipVideo: place.ownershipVideoUrl || undefined,
            })
          }
          className="rounded-2xl bg-primary h-[35px] px-2 text-white flex justify-center items-center gap-2"
        >
          <HugeiconsIcon icon={Edit02Icon} size={16} color="#FFFFFF" />
          <p className="font-normal text-sm">Edit</p>
        </button>

        <button
          onClick={() => onDelete?.(place)}
          className="rounded-2xl text-[#FF383C] bg-[#F6DDDD] h-[35px] px-2 flex justify-center items-center gap-2"
        >
          <HugeiconsIcon icon={Delete02Icon} color="#FF383C" size={16} />
          <p className="font-normal text-sm">Delete</p>
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-y-4 lg:items-center gap-x-5 mt-6 justify-between">
        <div className="flex items-center justify-between gap-x-2">
          <h2 className="text-[#0F0F0F]">Approval Status</h2>
          <StatusBadge
            status={
              status === "PUBLISHED"
                ? "ACTIVE"
                : status === "UNPUBLISHED"
                  ? "PENDING"
                  : "REJECTED"
            }
            title={status === "UNPUBLISHED" ? "Review Pending" : status}
          />
        </div>
        <div className="max-w-[383px] 2xl:max-w-[453px] w-full h-1.5 rounded-2xl bg-primary-accent">
          <div
            className={cn(
              "h-full bg-primary rounded-2xl",
              status === "DRAFT"
                ? "w-1/4"
                : status === "UNPUBLISHED"
                  ? "w-2/4"
                  : "w-full",
            )}
          />
        </div>

        <button className="flex items-center w-fit bg-primary-accent p-2 rounded-3xl gap-x-2">
          <p className="text-primary line-clamp-1">
            {status == "PUBLISHED" ? "Edit Place" : "Awaiting Publishing"}
          </p>
          <div className="p-1.5 rounded-full bg-primary">
            <HugeiconsIcon icon={ArrowRight02Icon} size={16} color={"white"} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default function Places({
  title,
  places,
  onEdit,
  onDelete,
  onAdd,
}: {
  title: string;
  places: SinglePlace[];
  onEdit?: (place: SinglePlace) => void;
  onDelete?: (place: SinglePlace) => void;
  onAdd: () => void;
}) {
  if (places.length === 0) {
    return null;
  }

  return (
    <ContainerWrapper className="space-y-3 w-full">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-base text-primary-text">{title}</h1>
        <AddButton title="Add Place" onClick={onAdd} />
      </div>
      {places.map((place) => (
        <Place
          key={place.id}
          place={place}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ContainerWrapper>
  );
}
