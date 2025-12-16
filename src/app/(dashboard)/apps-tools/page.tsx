"use client";

import { Modal } from "@/components/modal";
import SearchBar from "@/components/search-bar";
import { Switch } from "@/components/ui/switch";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { useAppSelector } from "@/hooks/redux";
import { selectFilteredApps } from "@/store/selectors";
import React from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { RadioGroup, RadioGroupItem } from "./_components/primary-radio-group";
import { ChevronDown } from "lucide-react";

// Type for app with status
type AppWithStatus = {
  name: string;
  description: string;
  amount?: number;
  isActive: boolean;
  default?: boolean;
  icon: string;
  integrated?: boolean;
  publisher?: string;
};

export default function Apps() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<AppWithStatus | null>(
    null
  );

  // Redux state and actions
  const {
    toggleAppState,
    searchQuery,
    updateSearchQuery,
    categoryFilter,
    updateCategoryFilter,
  } = useReduxApps();
  const filteredApps = useAppSelector(selectFilteredApps);
  const filters = [
    { label: "All Apps", value: "" },
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
    { label: "Default Apps", value: "default" },
    { label: "Community Apps", value: "community" },
  ];
  return (
    <section>
      <div className="h-[161px] 2xl:h-[200px] rounded-[32px] !p-0 overflow-hidden mb-6">
        <img
          src={"/apps-tools.png"}
          alt={"Apps Background"}
          width={900}
          height={900}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Apps</h1>
        <SearchBar
          placeholder="Search Apps"
          className="bg-[#F3F3F3] w-full"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none flex items-center border p-1 rounded-lg">
              <p className="text-sm">
                {filters.find((item) => item.value === categoryFilter)?.label ||
                  "All Apps"}
              </p>
              <ChevronDown
                className="inline-block text-secondary-text ml-1"
                size={18}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[149px] py-3 px-1 mr-5 bg-neutral border rounded-2xl shadow-none border-neutral-accent">
              <RadioGroup
                value={categoryFilter}
                onValueChange={updateCategoryFilter}
              >
                {filters.map((item) => (
                  <DropdownMenuItem
                    key={item.label}
                    onClick={() => updateCategoryFilter(item.value)}
                    className="flex items-center cursor-pointer gap-2"
                  >
                    <RadioGroupItem value={item.value} />
                    <span className="text-xs text-secondary-text">
                      {item.label}
                    </span>
                  </DropdownMenuItem>
                ))}
              </RadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid my-5 gap-5 md:grid-cols-2">
        {filteredApps.length > 0 ? (
          filteredApps.map((app: AppWithStatus, index: number) => (
            <div
              key={app.name}
              onClick={() => {
                setSelectedApp(app);
                setIsModalOpen(true);
              }}
              className={`p-4 cursor-pointer rounded-xl ${
                index % 2 === 0
                  ? "lg:justify-self-start"
                  : "lg:justify-self-end"
              } md:max-w-[487px]  w-full flex items-center gap-x-3 bg-foreground`}
            >
              <Image
                src={app.icon}
                alt={app.name}
                width={100}
                height={100}
                className="w-20 h-20 object-contain flex-shrink-0"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm lg:text-base font-bold text-primary-text">
                    {app.name}
                  </h2>
                  <div className="flex items-center gap-x-2">
                    {app.default ? (
                      <div className="bg-primary-accent flex-shrink-0 border-primary text-primary border px-2.5 py-0.5 rounded-3xl">
                        <p className="text-xs">DEFAULT</p>
                      </div>
                    ) : (
                      <Switch
                        checked={app.isActive}
                        disabled={app.default}
                        onCheckedChange={() => toggleAppState(app.name)}
                      />
                    )}

                    {app.integrated && (
                      <div className="bg-green-100 flex-shrink-0 border border-green-800 text-green-800 px-2.5 py-0.5 rounded-3xl">
                        <p className="text-xs">INTEGRATED</p>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-sm text-secondary-text line-clamp-3">
                  {app.description}
                </p>
                <p className="text-base text-primary-text font-bold">
                  {app.amount ? `N${app.amount}/month` : "Free"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8">
            <p className="text-secondary-text text-base">
              No apps found matching &ldquo;{searchQuery}&rdquo;
            </p>
            <p className="text-sm text-secondary-text mt-1">
              Try searching for a different app name or description
            </p>
          </div>
        )}
      </div>
      <Modal
        className="max-w-[535px] flex gap-x-4"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <Image
          src={selectedApp?.icon || ""}
          alt={selectedApp?.name || ""}
          width={100}
          height={100}
          className="w-[100px] mx-auto mb-3 h-[100px] object-contain"
        />
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-x-1">
              <h2 className="text-sm lg:text-base font-bold text-primary-text">
                {selectedApp?.name}
              </h2>
              {selectedApp?.default ? (
                <>
                  <div className="w-1 h-1 rounded-full bg-neutral-accent" />
                  <p className="text-[10px] text-neutral-accent">DEFAULT</p>
                </>
              ) : null}
            </div>

            <Switch
              checked={selectedApp?.isActive || false}
              disabled={selectedApp?.default}
              onCheckedChange={() => {
                if (selectedApp?.name) {
                  setSelectedApp((prev) =>
                    prev ? { ...prev, isActive: !prev.isActive } : prev
                  );
                  toggleAppState(selectedApp.name);
                }
              }}
            />
          </div>
          <p className="text-sm text-secondary-text">
            {selectedApp?.description}
          </p>
          <div className="flex items-center gap-x-1.5">
            <p className="text-sm text-primary-text font-bold">
              {selectedApp?.amount ? `N${selectedApp.amount}/month` : "Free"}
            </p>
            <p className="text-secondary-text text-xs">
              Published by{" "}
              <span className="font-bold">
                {selectedApp?.publisher || "SpinStrip"}
              </span>
            </p>
          </div>
        </div>
      </Modal>
    </section>
  );
}
