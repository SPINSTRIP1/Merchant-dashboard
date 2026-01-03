import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import React from "react";
import { Place } from "../../_schemas";
import Image from "next/image";
import {
  Globe02Icon,
  Location01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getPlaceType } from "../../_utils";
import { Button } from "@/components/ui/button";
import { usePlacesForm } from "../../_context";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { PLACES_SERVER_URL } from "@/constants";
import { useDebounce } from "../../_hooks/use-debounce";
import Loader from "@/components/loader";
import EmptyState from "@/components/empty-state";

export interface SinglePlace extends Omit<Place, "coverImage"> {
  coverImage: string;
  stats: {
    visitors: number;
    facilities: number;
    revenue: number;
    sales: number;
    reservations: number;
  };
}

export default function FindPlace() {
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const { setCurrentStep } = usePlacesForm();
  const { items, isLoading } = useServerPagination<SinglePlace>({
    queryKey: "unclaimed-places",
    endpoint: `${PLACES_SERVER_URL}/places/unclaimed`,
    searchQuery: debouncedSearchQuery,
  });

  if (isLoading) return <Loader />;

  return (
    <div>
      <div className="flex items-center justify-between w-full">
        <SearchBar
          placeholder="Search"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <Dropdown
          header=""
          options={["Name", "Price", "Stock", "Date Updated", "Date Created"]}
          placeholder="Sort by"
          onSelect={() => {}}
        />
      </div>
      <div className="grid grid-cols-2 mt-5 gap-5">
        {!items || items.length === 0 ? (
          <div className="col-span-2">
            <EmptyState
              title="No Places Found"
              description={
                searchQuery
                  ? "No places match your search criteria. Please try again with different keywords."
                  : "No places available to claim at the moment."
              }
              className="pt-20"
            />
          </div>
        ) : (
          items.map((place, index) => (
            <div key={index} className="flex flex-col gap-y-1.5">
              <Image
                src={place.coverImage || ""}
                alt={place.name!}
                width={960}
                height={650}
                className="w-full h-[206px] object-cover object-center rounded-xl"
              />

              <h1 className="text-xl md:text-2xl font-bold text-primary-text">
                {place.name} - {place.city}
              </h1>
              <p className="text-base text-primary-text">
                {getPlaceType(place.placeType!)}
              </p>

              <p>{place.description}</p>

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
              <Button
                onClick={() => setCurrentStep(2)}
                size={"lg"}
                className="w-full mt-3"
              >
                Claim
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
