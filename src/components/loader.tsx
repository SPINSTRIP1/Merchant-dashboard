import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="grid place-items-center py-32" role="status" aria-label="Loading">
      <Loader2 className="h-9 w-9 animate-spin text-primary" />
    </div>
  );
}
