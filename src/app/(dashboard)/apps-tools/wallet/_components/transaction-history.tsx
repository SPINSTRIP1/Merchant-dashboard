import Dropdown from "@/components/dropdown";
import SearchBar from "@/components/search-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CancelSquareIcon,
  DownloadSquare01Icon,
  PlusSignSquareIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Package } from "lucide-react";
import { formatAmount } from "@/utils";

import EmptyState from "@/components/empty-state";

import { useState } from "react";

type Status = "SUCCESSFUL" | "PENDING" | "FAILED";

interface Transaction {
  id: string;
  amount: number;
  status: Status;
  paymentMethod: string;
  date: string;
  available: boolean;
}

export const statusColors: Record<Status, string> = {
  SUCCESSFUL: "text-[#34C759] bg-[#34C75926]",
  PENDING: "text-[#FF8D28] bg-[#F6E9DD]",
  FAILED: "text-red-600 bg-red-100",
};

export default function TransactionHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const items: Transaction[] = [
    // {
    //   id: "TXN001",
    //   amount: 150.0,
    //   status: "SUCCESSFUL",
    //   paymentMethod: "Credit Card",
    //   date: "12/01/2025",
    //   available: true,
    // },
    // {
    //   id: "TXN002",
    //   amount: 150.0,
    //   status: "SUCCESSFUL",
    //   paymentMethod: "Credit Card",
    //   date: "12/01/2025",
    //   available: true,
    // },
    // {
    //   id: "TXN003",
    //   amount: 150.0,
    //   status: "SUCCESSFUL",
    //   paymentMethod: "Credit Card",
    //   date: "12/01/2025",
    //   available: false,
    // },
  ];
  const isLoading = false;

  return (
    <section>
      <div className="flex flex-col md:flex-row md:items-center gap-y-3 justify-between w-full">
        <h1 className="text-sm lg:text-base font-bold text-primary-text">
          Transaction History
        </h1>
        <SearchBar
          placeholder="Search transactions"
          className="bg-[#F3F3F3] w-full max-w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex items-center gap-x-2">
          <Dropdown
            header=""
            options={["All Status", "In Stock", "Low Stock", "Out of Stock"]}
            placeholder="All"
            onSelect={() => {}}
          />
          <Dropdown
            header=""
            options={["This Year", "This Month", "This Week"]}
            placeholder="This Year"
            onSelect={() => {}}
          />
        </div>
      </div>
      <div className="bg-foreground rounded-3xl p-5 mt-8">
        <Table>
          <TableHeader>
            <TableRow className="border-b-0">
              {[
                "Date",
                "Amount",

                "Status",
                "Payment Method",
                "Transaction ID",
                "Action",
              ].map((header) => (
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
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10">
                  <p className="text-gray-500">Loading inventory...</p>
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-0">
                  <EmptyState
                    icon={<Package className="h-16 w-16 text-primary" />}
                    title="No Transactions Yet"
                    description={
                      searchQuery
                        ? "No items match your search criteria. Try adjusting your filters."
                        : "Transactions will appear here when customers make purchases from your business."
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              items?.map((item) => (
                <TableRow
                  className="border-b-0 cursor-pointer hover:bg-neutral"
                  key={item.id}
                >
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{formatAmount(item.amount)}</TableCell>
                  <TableCell className="w-[140px]">
                    <div
                      className={`${
                        statusColors[item.status as Status] ||
                        statusColors["SUCCESSFUL"]
                      } w-[80px] flex items-center justify-center py-1 rounded-lg`}
                    >
                      <p className="font-semibold uppercase text-xxs">
                        {item.status}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{item.paymentMethod}</TableCell>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>
                    {item.available ? (
                      <button className="border flex items-center gap-x-1 border-secondary-text px-1 py-0.5 rounded-lg text-sm">
                        <p className="text-secondary-text"> Download</p>
                        <HugeiconsIcon
                          icon={DownloadSquare01Icon}
                          size={16}
                          color={"#6F6D6D"}
                          strokeWidth={2.2}
                        />
                      </button>
                    ) : (
                      <button className="border flex items-center gap-x-1 border-neutral-accent px-1 py-0.5 rounded-lg text-sm">
                        <p className="text-neutral-accent"> Unavailable</p>
                        <HugeiconsIcon
                          icon={CancelSquareIcon}
                          size={16}
                          color={"#C8C8C8"}
                          strokeWidth={2.2}
                        />
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Component */}
      {/* {!isLoading && totalPages > 0 && (
        <PaginationButton
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )} */}
    </section>
  );
}
