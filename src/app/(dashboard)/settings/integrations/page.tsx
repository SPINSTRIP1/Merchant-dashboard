"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Calculator, Code2, Megaphone, MonitorSmartphone } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";

const COMING = [
  { title: "POS systems", text: "Sync orders and payments from your point-of-sale.", icon: MonitorSmartphone },
  { title: "Accounting", text: "Send settlements and invoices to your bookkeeping tool.", icon: Calculator },
  { title: "Marketing", text: "Reach your SpinStrip customers through email and SMS tools.", icon: Megaphone },
  { title: "API keys & webhooks", text: "Build your own integrations on SpinStrip data.", icon: Code2 },
];

export default function IntegrationsPage() {
  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Integrations" />
      <PageHeader title="Integrations" subtitle="Connect SpinStrip to the tools you already use." />

      <Link
        href="/apps-tools"
        className="card-hover mb-4 flex items-center justify-between gap-3 rounded-2xl border bg-card p-5"
      >
        <span>
          <span className="block font-display font-bold text-foreground">SpinStrip Apps</span>
          <span className="block text-xs text-muted-foreground">
            Turn Menu, Places, Events, Inventory and Deals on or off from Apps &amp; Tools.
          </span>
        </span>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
      </Link>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {COMING.map(({ title, text, icon: Icon }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex gap-4 rounded-2xl border border-dashed bg-card p-5"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-display font-bold text-foreground">{title}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary">
                  Coming soon
                </span>
              </span>
              <span className="mt-1 block text-xs text-muted-foreground">{text}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
