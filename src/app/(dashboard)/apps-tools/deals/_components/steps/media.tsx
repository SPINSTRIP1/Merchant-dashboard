import { Label } from "@/components/ui/label";
import React from "react";
import UploadFile from "../../../inventory/_components/upload-file";

export default function Media() {
  return (
    <div className="space-y-7">
      <div className="space-y-1.5 w-full">
        <Label>Upload Menu Images</Label>
        <div className="flex w-full gap-4 flex-wrap">
          <UploadFile fileName="thumbnail" label="Thumbnail" />
          <UploadFile fileName="thumbnail" />
          <UploadFile fileName="thumbnail" />
          <UploadFile fileName="thumbnail" />
          <UploadFile fileName="thumbnail" />
        </div>
      </div>
      <div className="flex items-center justify-center flex-col">
        <p className={"text-sm"}>Click to upload logo or drop image here</p>
        <span className="text-[9px] font-semibold text-gray-500">
          JPG, JPEG, PNG, GIF formats supported
        </span>
      </div>
    </div>
  );
}
