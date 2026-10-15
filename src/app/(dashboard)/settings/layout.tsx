import React from "react";
import SettingsNav from "./_components/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SettingsNav />
      {children}
    </>
  );
}
