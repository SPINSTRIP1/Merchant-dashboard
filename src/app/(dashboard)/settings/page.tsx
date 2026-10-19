"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import PageHeader from "@/components/page-header";
import StatusPill from "@/components/status-pill";
import { useComplianceStatus } from "@/hooks/use-compliance";
import { SETTINGS_SECTIONS } from "./_components/settings-nav";

export default function Settings() {
  const { data: status, percent, isLoading } = useComplianceStatus();

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Compliance, preferences, security and integrations."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {SETTINGS_SECTIONS.map(
          ({ title, description, href, icon: Icon }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={href}
                className="card-hover group flex h-full items-start gap-4 rounded-2xl border bg-card p-5"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display font-bold text-foreground">
                      {title}
                    </span>
                    {href === "/settings/compliance" && !isLoading && (
                      <StatusPill status={status} />
                    )}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {description}
                  </span>
                  {href === "/settings/compliance" &&
                    !isLoading &&
                    status !== "VERIFIED" && (
                      <span className="mt-3 block">
                        <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
                          <span
                            className="brand-gradient block h-full rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </span>
                        <span className="mt-1 block text-[11px] text-muted-foreground">
                          {percent}% complete
                        </span>
                      </span>
                    )}
                </span>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>
          ),
        )}
      </div>
    </div>
  );
}
