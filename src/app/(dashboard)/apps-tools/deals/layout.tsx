"use client";
import { DealsFormProvider } from "./_context";

export default function DealsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DealsFormProvider>{children}</DealsFormProvider>;
}
