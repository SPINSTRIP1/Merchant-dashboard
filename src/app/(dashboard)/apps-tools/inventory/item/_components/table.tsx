import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import React from "react";

type Status = "In Stock" | "Low Stock" | "Out of Stock";
interface InventoryItem {
  date: string;
  action: string;
  staff: {
    name: string;
    role: string;
    avatar: string;
  };
}
const items: InventoryItem[] = [
  {
    date: "2 days ago",
    action: "Added media image",
    staff: {
      name: "Tobey Shang",
      role: "Admin",
      avatar: "/avatar.jpg",
    },
  },
];

export const statusColors: Record<Status, string> = {
  "In Stock": "text-[#34C759] bg-[#34C75926]",
  "Low Stock": "text-[#FF8D28] bg-[#F6E9DD]",
  "Out of Stock": "text-red-600 bg-red-100",
};

export default function InventoryItemTable() {
  return (
    <div className="bg-foreground rounded-3xl p-5 mt-8">
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            {["Date", "Action", "Staff"].map((header) => (
              <TableHead
                key={header}
                className="text-primary-text font-bold text-base"
              >
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow className="border-b-0 hover:bg-neutral" key={item.date}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.action}</TableCell>
              <TableCell>
                <div className="flex items-center gap-x-2">
                  <div className="w-6 h-6 rounded-2xl overflow-hidden bg-gray-300 flex items-center justify-center">
                    <Image
                      src={item.staff.avatar}
                      alt={item.staff.name}
                      width={24}
                      height={24}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-secondary-text">{item.staff.name}</p>
                  <div className="bg-primary-accent rounded-lg p-1">
                    <p className="text-xs font-semibold text-primary">
                      {item.staff.role}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
