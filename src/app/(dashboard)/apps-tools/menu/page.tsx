"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Check, Copy, ExternalLink, Settings2 } from "lucide-react";
import Breadcrumb from "@/components/breadcrumb";
import PageHeader from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useReduxApps } from "@/hooks/use-redux-apps";
import { useAppSelector } from "@/hooks/redux";
import { selectUser } from "@/store/selectors";
import { publicRestaurantUrl } from "@/lib/public-links";
import { cn } from "@/lib/utils";
import MenuTable from "./_components/menu-table";
import TablesTab from "./_components/tables-tab";
import TableAnalyticsTab from "./_components/table-analytics-tab";
import ReviewsTab from "./_components/reviews-tab";

const TABS = ["items", "tables", "analytics", "reviews"] as const;
type Tab = (typeof TABS)[number];

export default function MenuPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = searchParams.get("view");
  const tab: Tab = TABS.includes(view as Tab) ? (view as Tab) : "items";

  const { appsWithStatus, setAppActiveState } = useReduxApps();
  const enabled = appsWithStatus.find((app) => app.key === "menu")?.isActive ?? false;
  const [configOpen, setConfigOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const user = useAppSelector(selectUser);
  // The restaurant's page on the public site (places.spinstrip.com), keyed by the merchant's user id.
  const publicUrl = publicRestaurantUrl(user?.id);

  const setTab = (next: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "items") params.delete("view");
    else params.set("view", next);
    params.delete("page");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const toggleApp = (active: boolean) => {
    setAppActiveState("menu", active);
    toast.success(active ? "Menu app activated — your public menu page is live" : "Menu app deactivated");
  };

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      toast.success("Public menu URL copied");
    } catch {
      toast.error("Couldn't copy the link — copy it from the address shown instead.");
    }
  };

  return (
    <div>
      <Breadcrumb parent={{ label: "Tools", href: "/apps-tools" }} current="Restaurant" />
      <PageHeader
        title="Restaurant"
        subtitle="Manage dishes, table QR codes and your public menu page."
        actions={
          <Button variant="outline" onClick={() => setConfigOpen(true)}>
            <Settings2 /> Configure Tool
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3"
      >
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            enabled ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"
          )}
        >
          {enabled ? "Live" : "Off"}
        </span>
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {enabled ? publicUrl : "Turn on the Menu app to publish your public menu page."}
        </p>
        {enabled ? (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={copyUrl}>
              {copied ? <Check className="text-emerald-500" /> : <Copy />} Copy URL
            </Button>
            <Button size="sm" variant="brand" asChild>
              <Link href={publicUrl} target="_blank" rel="noopener">
                <ExternalLink /> View Public Menu
              </Link>
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="soft" onClick={() => toggleApp(true)}>
            Turn on
          </Button>
        )}
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="items">Menu Items</TabsTrigger>
          <TabsTrigger value="tables">Tables &amp; QR</TabsTrigger>
          <TabsTrigger value="analytics">Table Analytics</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <MenuTable />
        </TabsContent>
        <TabsContent value="tables">
          <TablesTab qrUrlFor={(tableNumber) => publicRestaurantUrl(user?.id, String(tableNumber))} />
        </TabsContent>
        <TabsContent value="analytics">
          <TableAnalyticsTab />
        </TabsContent>
        <TabsContent value="reviews">
          <ReviewsTab />
        </TabsContent>
      </Tabs>

      <Sheet open={configOpen} onOpenChange={setConfigOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Configure Menu Tool</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <label className="flex min-h-[48px] items-center justify-between gap-3 rounded-2xl border bg-card px-4 text-sm font-medium text-foreground">
              Menu app
              <Switch showLabel={false} checked={enabled} onCheckedChange={toggleApp} />
            </label>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-foreground">Public menu page URL</p>
              <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2.5 text-xs text-muted-foreground">
                <span className="min-w-0 flex-1 truncate">{publicUrl}</span>
                <button type="button" onClick={copyUrl} className="shrink-0 text-primary" aria-label="Copy URL">
                  {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Share this link with diners, or use the table QR codes in the Tables &amp; QR tab.
              </p>
            </div>
            {enabled && (
              <Button variant="brand" className="w-full" asChild>
                <Link href={publicUrl} target="_blank" rel="noopener">
                  <ExternalLink /> View Public Menu
                </Link>
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
