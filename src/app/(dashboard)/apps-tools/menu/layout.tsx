"use client";
import { MenuFormProvider } from "./_context";

export default function InventoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MenuFormProvider>{children}</MenuFormProvider>;
}
