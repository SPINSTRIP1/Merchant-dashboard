"use client";
import { MenuFormProvider } from "./_context";

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MenuFormProvider>{children}</MenuFormProvider>;
}
