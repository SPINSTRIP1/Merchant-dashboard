import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import { FileSpreadsheet, UserPlus, Users } from "lucide-react";
import EmptyState from "@/components/empty-state";
import Field from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useServerPagination } from "@/hooks/use-server-pagination";
import { SERVER_URL } from "@/constants";
import PaginationButton from "@/components/pagination-button";
import { useDebounce } from "@/hooks/use-debounce";
import { useAddPlaceVisitor } from "@/hooks/use-place-extras";
import { exportCsv } from "@/utils";

interface Visitor {
  id: string;
  appointmentId: string;
  visitorName: string;
  visitorEmail: string;
  visitorPhone: string;
  purpose: string;
}

const EMPTY_VISITOR = { visitorName: "", visitorEmail: "", visitorPhone: "", purpose: "" };

export default function VisitorList() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const { id } = useParams() as { id: string | undefined };
  const { items, currentPage, totalPages, isLoading, handlePageChange } =
    useServerPagination<Visitor>({
      queryKey: ["places-visitors", id || ""],
      endpoint: `${SERVER_URL}/places/${id}/visitors`,
      enabled: !!id,
      searchQuery: debouncedSearch,
    });

  // Walk-ins recorded here go through `POST /places/{id}/visit` and then show up in the list.
  const addVisitor = useAddPlaceVisitor(id ?? "");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(EMPTY_VISITOR);

  const rows = items ?? [];

  const handleExport = () =>
    exportCsv(
      "visitors.csv",
      ["Name", "Email Address", "Phone Number", "Purpose"],
      rows.map((v) => [v.visitorName, v.visitorEmail, v.visitorPhone, v.purpose])
    );

  const submitVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.visitorName.trim() || !draft.visitorEmail.trim()) return;
    try {
      await addVisitor.mutateAsync({
        ...draft,
        visitorName: draft.visitorName.trim(),
        visitorEmail: draft.visitorEmail.trim(),
      });
      setDraft(EMPTY_VISITOR);
      setAdding(false);
    } catch {
      // error toast shown by the hook; keep the form open
    }
  };

  return (
    <section className="w-full">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <SearchBar
          placeholder="Search visitors…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={handleExport} disabled={!rows.length}>
            <FileSpreadsheet /> Export Sheet
          </Button>
          <Button variant="brand" onClick={() => setAdding(true)}>
            <UserPlus /> Add Visitor
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Users />}
            title="No visitors yet"
            description={
              searchQuery
                ? "No visitors match your search."
                : "Visitors checked into this place will appear here."
            }
          />
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email Address</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Purpose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-foreground">
                    {item.visitorName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.visitorEmail || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.visitorPhone || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{item.purpose || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {!isLoading && totalPages > 1 && (
          <div className="border-t">
            <PaginationButton currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Visitor</DialogTitle>
            <DialogDescription>Record a visitor who checked into this place.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitVisitor} className="space-y-4">
            <Field label="Name" htmlFor="visitor-name">
              <Input
                id="visitor-name"
                required
                value={draft.visitorName}
                onChange={(e) => setDraft({ ...draft, visitorName: e.target.value })}
                placeholder="Full name"
              />
            </Field>
            <Field label="Email Address" htmlFor="visitor-email">
              <Input
                id="visitor-email"
                type="email"
                required
                value={draft.visitorEmail}
                onChange={(e) => setDraft({ ...draft, visitorEmail: e.target.value })}
                placeholder="name@email.com"
              />
            </Field>
            <Field label="Phone Number" htmlFor="visitor-phone">
              <Input
                id="visitor-phone"
                type="tel"
                value={draft.visitorPhone}
                onChange={(e) => setDraft({ ...draft, visitorPhone: e.target.value })}
                placeholder="0810 000 0000"
              />
            </Field>
            <Field label="Purpose" htmlFor="visitor-purpose">
              <Input
                id="visitor-purpose"
                value={draft.purpose}
                onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}
                placeholder="e.g. Short let check-in"
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={!draft.visitorName.trim() || !draft.visitorEmail.trim() || addVisitor.isPending}>
                {addVisitor.isPending ? "Adding…" : "Add Visitor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
