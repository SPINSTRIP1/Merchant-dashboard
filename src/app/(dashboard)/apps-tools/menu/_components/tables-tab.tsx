"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import {
  Download,
  Maximize2,
  MoreVertical,
  Pencil,
  Plus,
  QrCode,
  Trash2,
} from "lucide-react";
import Field from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMenuTables, type DiningTable } from "@/hooks/use-menu-tables";
import { useTableAnalytics } from "@/hooks/use-menu-analytics";

const EMPTY_FORM = { name: "", description: "", seats: 4 };

/** "Table 3 · Window" — the number is what guests see on the QR menu. */
export const tableTitle = (table: Pick<DiningTable, "number" | "name">) =>
  table.name
    ? `Table ${table.number} · ${table.name}`
    : `Table ${table.number}`;

const qrElementId = (tableId: string) => `table-qr-${tableId}`;

/**
 * Saves a table's QR as a print-ready PNG: the code drawn large from the on-screen SVG, with the
 * table number and name underneath so printed cards can't get mixed up.
 */
async function downloadTableQr(table: DiningTable) {
  const svg = document.getElementById(qrElementId(table.id));
  if (!(svg instanceof SVGSVGElement)) return;

  const SIZE = 1000;
  const PAD = 100;
  const FOOTER = table.name ? 260 : 190;
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
  await image.decode();

  const canvas = document.createElement("canvas");
  canvas.width = SIZE + PAD * 2;
  canvas.height = SIZE + PAD * 2 + FOOTER;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, PAD, PAD, SIZE, SIZE);

  const centre = canvas.width / 2;
  let y = PAD + SIZE + 110;
  ctx.textAlign = "center";
  ctx.fillStyle = "#6932E2";
  ctx.font = "800 96px system-ui, sans-serif";
  ctx.fillText(`Table ${table.number}`, centre, y);
  if (table.name) {
    y += 80;
    ctx.fillStyle = "#0F0F0F";
    ctx.font = "600 56px system-ui, sans-serif";
    ctx.fillText(table.name, centre, y, canvas.width - PAD * 2);
  }
  ctx.fillStyle = "#6B6B6B";
  ctx.font = "500 40px system-ui, sans-serif";
  ctx.fillText("Scan to view the menu & order", centre, y + 70);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `table-${table.number}${table.name ? `-${table.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}` : ""}-qr.png`;
  link.click();
  URL.revokeObjectURL(url);
}

/** `qrUrlFor(number)` builds the public-site link a table's QR code opens. */
export default function TablesTab({
  qrUrlFor,
}: {
  qrUrlFor: (tableNumber: number) => string;
}) {
  const { tables, isLoading, createTable, updateTable, deleteTable } =
    useMenuTables();
  const { tables: stats } = useTableAnalytics();
  const [editing, setEditing] = useState<DiningTable | "new" | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [removing, setRemoving] = useState<DiningTable | null>(null);
  const [previewing, setPreviewing] = useState<DiningTable | null>(null);

  const paidOrdersFor = (id: string) =>
    stats.find((t) => t.tableId === id)?.seatings ?? 0;
  const seatsValid =
    Number.isInteger(form.seats) && form.seats >= 1 && form.seats <= 100;
  const saving = createTable.isPending || updateTable.isPending;

  const openForm = (table: DiningTable | "new") => {
    setForm(
      table === "new"
        ? EMPTY_FORM
        : {
            name: table.name ?? "",
            description: table.description ?? "",
            seats: table.seats,
          },
    );
    setEditing(table);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !seatsValid || !editing) return;
    try {
      if (editing === "new") {
        const created = await createTable.mutateAsync(form);
        toast.success(`Table ${created.number} created with its QR code`);
      } else {
        await updateTable.mutateAsync({ id: editing.id, ...form });
        toast.success(`Table ${editing.number} updated`);
      }
      setEditing(null);
    } catch (error) {
      toast.error((error as Error).message || "Could not save the table");
    }
  };

  const download = (table: DiningTable) =>
    downloadTableQr(table).catch(() =>
      toast.error("Could not download the QR code"),
    );

  const confirmRemove = async () => {
    if (!removing) return;
    try {
      await deleteTable.mutateAsync(removing.id);
      toast.success(`${tableTitle(removing)} removed`);
      setRemoving(null);
    } catch (error) {
      toast.error((error as Error).message || "Could not remove the table");
    }
  };

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Each table gets a number and a QR code that opens your public menu
          with the table pre-selected, so orders are tagged to it.
        </p>
        <Button variant="brand" onClick={() => openForm("new")}>
          <Plus /> Add Table
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[264px] rounded-2xl" />
            ))
          : tables.map((table, i) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="card-hover relative rounded-2xl border bg-card p-4 text-center"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`Manage ${tableTitle(table)}`}
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44 rounded-xl">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setPreviewing(table)}
                    >
                      <Maximize2 className="mr-2 h-4 w-4" /> Preview QR
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => openForm(table)}
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit Table
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => download(table)}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download QR
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-rose-500 focus:text-rose-500"
                      onClick={() => setRemoving(table)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Table
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <div className="mx-auto w-fit rounded-xl bg-white p-2 shadow-sm">
                  <QRCodeSVG
                    id={qrElementId(table.id)}
                    value={qrUrlFor(table.number)}
                    size={104}
                    fgColor="#6932E2"
                    title={`QR code for ${tableTitle(table)}`}
                  />
                </div>
                <p className="mt-3 font-display text-2xl font-extrabold text-primary">
                  {table.number}
                </p>
                <p className="truncate font-display text-sm font-bold text-foreground">
                  {table.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {table.seats} seats · {paidOrdersFor(table.id)} paid orders
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={() => download(table)}
                >
                  <Download /> Download QR
                </Button>
              </motion.div>
            ))}
        <button
          type="button"
          onClick={() => openForm("new")}
          className="grid min-h-[264px] place-items-center rounded-2xl border-2 border-dashed border-primary/30 text-primary transition-colors hover:bg-primary/5"
        >
          <span className="flex flex-col items-center gap-2 text-sm font-semibold">
            <QrCode className="h-7 w-7" /> New table QR
          </span>
        </button>
      </div>

      <Dialog
        open={!!editing}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing === "new"
                ? "Add Table"
                : editing
                  ? `Edit ${tableTitle(editing)}`
                  : ""}
            </DialogTitle>
            <DialogDescription>
              {editing === "new"
                ? "The table gets the next number and its QR code straight away."
                : "The table number and its QR code stay the same."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <Field
              label="Name"
              htmlFor="table-name"
              hint="Shown alongside the number, e.g. Window, Terrace, VIP Booth."
            >
              <Input
                id="table-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Window"
              />
            </Field>
            <Field
              label="Seats"
              htmlFor="table-seats"
              error={seatsValid ? undefined : "Enter between 1 and 100 seats"}
            >
              <Input
                id="table-seats"
                type="number"
                min={1}
                max={100}
                value={form.seats}
                onChange={(e) =>
                  setForm({ ...form, seats: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Description (optional)" htmlFor="table-description">
              <Textarea
                id="table-description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="e.g. By the window, lagoon view"
              />
            </Field>
            <Button
              type="submit"
              variant="brand"
              className="w-full"
              disabled={!form.name.trim() || !seatsValid || saving}
            >
              {saving
                ? "Saving…"
                : editing === "new"
                  ? "Create Table"
                  : "Save Changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* A large, high-contrast QR so it can be test-scanned straight off the screen. */}
      <Dialog
        open={!!previewing}
        onOpenChange={(open) => !open && setPreviewing(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {previewing ? tableTitle(previewing) : ""}
            </DialogTitle>
            <DialogDescription>
              Scan with your phone camera to open the menu for this table.
            </DialogDescription>
          </DialogHeader>
          {previewing && (
            <>
              <div className="mx-auto w-full max-w-[340px] rounded-2xl bg-white p-4 shadow-sm">
                <QRCodeSVG
                  value={qrUrlFor(previewing.number)}
                  size={512}
                  level="M"
                  fgColor="#6932E2"
                  title={`QR code for ${tableTitle(previewing)}`}
                  className="h-auto w-full"
                />
              </div>

              <Button
                variant="brand"
                className="w-full"
                onClick={() => download(previewing)}
              >
                <Download /> Download QR
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removing}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {removing ? tableTitle(removing) : ""}?
            </DialogTitle>
            <DialogDescription>
              Its QR code will stop working — remove printed copies from the
              table. Past orders keep their link to it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmRemove}
              disabled={deleteTable.isPending}
            >
              {deleteTable.isPending ? "Deleting…" : "Delete Table"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
