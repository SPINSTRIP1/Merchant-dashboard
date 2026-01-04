"use client";
import { EventsFormProvider } from "./_context";

export default function EventLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <EventsFormProvider>{children}</EventsFormProvider>;
}
