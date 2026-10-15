"use client";

import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";

const DOCUMENTS = [
  {
    title: "Merchant Agreement",
    text: "The terms for selling, settling and running your business on SpinStrip.",
  },
  {
    title: "Privacy Policy",
    text: "How SpinStrip collects, uses and protects your and your customers' data (NDPR-aligned).",
  },
  {
    title: "Platform Terms of Use",
    text: "The rules that apply to everyone using SpinStrip apps and public pages.",
  },
  {
    title: "Refund & Cancellation Policy",
    text: "How refunds for tickets, bookings and orders are handled.",
  },
];

export default function LegalPage() {
  return (
    <div>
      <Breadcrumb parent={{ label: "Settings", href: "/settings" }} current="Legal & Policies" />
      <PageHeader title="Legal & Policies" subtitle="The agreements that cover your business on SpinStrip." />
      <ul className="max-w-3xl space-y-3">
        {DOCUMENTS.map((doc, i) => (
          <motion.li
            key={doc.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-4 rounded-2xl border bg-card p-5"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display font-bold text-foreground">{doc.title}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">{doc.text}</span>
            </span>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
              Published soon
            </span>
          </motion.li>
        ))}
      </ul>
      <p className="mt-4 max-w-3xl text-xs text-muted-foreground">
        Document versions and your acceptance history will appear here once they&apos;re published.
      </p>
    </div>
  );
}
