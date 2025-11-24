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

// Type for app with status
type AppWithStatus = {
  name: string;
  description: string;
  amount?: number;
  isActive: boolean;
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
      <ContainerWrapper className="h-[121px] bg-primary-background mb-6">
        <div></div>
      </ContainerWrapper>
      <div className="flex items-center justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold">Apps</h1>
        <SearchBar
          placeholder="Search Apps"
          className="bg-[#F3F3F3] w-full"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
        />
        <Dropdown header="" options={["All", "Some"]} placeholder="All" />
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
              <div className="size-[100px] flex-shrink-0 bg-primary-background rounded-xl" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm lg:text-base font-bold text-primary-text">
                    {app.name}
                  </h2>
                  <Switch
                    checked={app.isActive}
                    onCheckedChange={() => toggleAppState(app.name)}
                  />
                </div>
                <p className="text-sm text-secondary-text">{app.description}</p>
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
