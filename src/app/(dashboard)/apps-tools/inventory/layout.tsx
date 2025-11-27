"use client";
import { InventoryFormProvider } from "./_context";

export default function InventoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <InventoryFormProvider>{children}</InventoryFormProvider>;
}
