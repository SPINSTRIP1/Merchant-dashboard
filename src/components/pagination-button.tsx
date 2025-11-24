import React from "react";
import { Button } from "./ui/button";

export default function PaginationButton({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = maxVisiblePages - leftOffset - 1;

      let start = Math.max(1, currentPage - leftOffset);
      let end = Math.min(totalPages, currentPage + rightOffset);

      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-end gap-x-2 my-6 px-2">
      {/* Previous Button */}
      <Button
        variant="outline"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className="flex items-center gap-1 px-2 h-7 rounded-lg bg-[#F3F3F3] border border-[#C8C8C8] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="inline text-neutral-accent font-bold">Prev</span>
      </Button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => (
          <button
            key={index}
            onClick={() => onPageChange(pageNum)}
            className={`h-7 px-2.5 font-bold rounded-lg border ${
              currentPage === pageNum
                ? "bg-foreground text-secondary-text border-secondary-text"
                : " border-neutral-accent text-neutral-accent hover:bg-foreground"
            }`}
          >
            {pageNum}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="flex items-center gap-1 px-2 h-7 rounded-lg border border-[#C8C8C8] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="inline text-neutral-accent font-bold">Next</span>
      </Button>
    </div>
  );
}
