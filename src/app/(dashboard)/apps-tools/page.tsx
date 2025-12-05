"use client";
import ContainerWrapper from "@/components/container-wrapper";
import Dropdown from "@/components/dropdown";
import { Modal } from "@/components/modal";
import SearchBar from "@/components/search-bar";
import { Switch } from "@/components/ui/switch";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { useAppSelector } from "@/hooks/redux";
import { selectFilteredApps } from "@/store/selectors";
import React from "react";
import Image from "next/image";

// Type for app with status
type AppWithStatus = {
  name: string;
  description: string;
  amount?: number;
  isActive: boolean;
  default?: boolean;
  icon: string;
  integrated?: boolean;
};

export default function Apps() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedApp, setSelectedApp] = React.useState<AppWithStatus | null>(
    null
  );

  // Redux state and actions
  const { toggleAppState, searchQuery, updateSearchQuery } = useReduxApps();
  const filteredApps = useAppSelector(selectFilteredApps);
  return (
    <section>
      <ContainerWrapper className="h-[161px] p-0 overflow-hidden bg-primary-background mb-6">
        <Image
          src={"/icons/app-bg.png"}
          alt={"Apps Background"}
          width={700}
          height={700}
          className="w-full h-full object-cover"
        />
      </ContainerWrapper>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Apps</h1>
        <SearchBar
          placeholder="Search Apps"
          className="bg-[#F3F3F3] w-full"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <Dropdown header="" options={["All"]} placeholder="All" />
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
        className="max-w-[309px]"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <ContainerWrapper className="h-[100px] rounded-lg bg-primary-background mb-3">
          <div></div>
        </ContainerWrapper>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm lg:text-base font-bold text-primary-text">
              {selectedApp?.name}
            </h2>
            <Switch
              checked={selectedApp?.isActive || false}
              onCheckedChange={() => {
                if (selectedApp?.name) {
                  toggleAppState(selectedApp.name);
                }
              }}
            />
          </div>
          <p className="text-sm text-secondary-text">
            {selectedApp?.description}
          </p>
          <p className="text-base text-primary-text font-bold">
            {selectedApp?.amount ? `N${selectedApp.amount}/month` : "Free"}
          </p>
        </div>
      </Modal>
    </section>
  );
}
