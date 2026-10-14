"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Plus, QrCode, Trash2 } from "lucide-react";
import Field from "@/components/field";
import SampleDataBadge from "@/components/sample-data-badge";
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
import { useMenuTables, type TableSummary } from "@/hooks/use-menu-tables";

export default function TablesTab({ publicUrl }: { publicUrl: string }) {
  const { tables, isLoading, createTable, deleteTable } = useMenuTables();
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [seats, setSeats] = useState(4);
  const [removing, setRemoving] = useState<TableSummary | null>(null);

  const seatsValid = Number.isInteger(seats) && seats >= 1 && seats <= 40;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !seatsValid) return;
    try {
      await createTable.mutateAsync({ label, seats });
      toast.success("Table created with QR code");
      setAdding(false);
      setLabel("");
      setSeats(4);
    } catch {
      toast.error("Could not create table");
    }
  };

  const confirmRemove = async () => {
    if (!removing) return;
    await deleteTable.mutateAsync(removing.id);
    toast.success(`${removing.label} removed`);
    setRemoving(null);
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Each table gets a unique QR code that opens your public menu with the table pre-selected.
          <SampleDataBadge label="Sample tables" />
        </p>
        <Button variant="brand" onClick={() => setAdding(true)}>
          <Plus /> Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-[200px] rounded-2xl" />)
          : tables.map((table, i) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="card-hover group relative rounded-2xl border bg-card p-4 text-center"
              >
                <button
                  type="button"
                  onClick={() => setRemoving(table)}
                  aria-label={`Delete ${table.label}`}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-rose-500 opacity-0 transition-opacity hover:bg-rose-500/10 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <div className="mx-auto w-fit rounded-xl bg-white p-2 shadow-sm">
                  <QRCodeSVG
                    value={`${publicUrl}?table=${table.qrToken}`}
                    size={104}
                    fgColor="#6932E2"
                    title={`QR code for ${table.label}`}
                  />
                </div>
                <p className="mt-3 font-display font-bold text-foreground">{table.label}</p>
                <p className="text-xs text-muted-foreground">
                  {table.seats} seats · {table.totalSeatings} seatings
                </p>
              </motion.div>
            ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="grid min-h-[200px] place-items-center rounded-2xl border-2 border-dashed border-primary/30 text-primary transition-colors hover:bg-primary/5"
        >
          <span className="flex flex-col items-center gap-2 text-sm font-semibold">
            <QrCode className="h-7 w-7" /> New table QR
          </span>
        </button>
      </div>

      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Table</DialogTitle>
            <DialogDescription>A QR code is generated for the table as soon as it&apos;s created.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Field label="Table label" htmlFor="table-label">
              <Input
                id="table-label"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Table 11 / Terrace A"
              />
            </Field>
            <Field
              label="Seats"
              htmlFor="table-seats"
              error={seatsValid ? undefined : "Enter between 1 and 40 seats"}
            >
              <Input
                id="table-seats"
                type="number"
                min={1}
                max={40}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </Field>
            <Button
              type="submit"
              variant="brand"
              className="w-full"
              disabled={!label.trim() || !seatsValid || createTable.isPending}
            >
              {createTable.isPending ? "Creating…" : "Create Table"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removing} onOpenChange={(open) => !open && setRemoving(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {removing?.label}?</DialogTitle>
            <DialogDescription>
              Its QR code will stop working. Printed copies on the table should be removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemove} disabled={deleteTable.isPending}>
              Delete Table
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
