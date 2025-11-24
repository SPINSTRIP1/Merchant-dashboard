import React from "react";

export default function Loader() {
  return (
    <div className="flex items-center justify-center mt-36">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}
