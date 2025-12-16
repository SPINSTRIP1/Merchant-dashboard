"use client";
import { PlacesFormProvider } from "./_context";

export default function DealsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PlacesFormProvider>{children}</PlacesFormProvider>;
}
