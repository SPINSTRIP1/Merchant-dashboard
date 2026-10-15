import Image from "next/image";
import { usePlacesForm } from "../../_context";
import { UploadFile } from "../upload-file";
import { Play } from "lucide-react";
import { FormInput } from "@/components/ui/forms/form-input";

export default function LocationVerification() {
  const {
    form: { control },
  } = usePlacesForm();

  return (
    <div className="space-y-5">
      <UploadFile
        control={control}
        name="ownershipDocument"
        label="Upload Proof of Ownership (Rent/Lease Receipt or Property Document)"
      />
      <FormInput
        control={control}
        name="ownershipVideoUrl"
        label="Location Verification Video URL"
        placeholder="Enter the YouTube video URL"
      />
      <div className="flex flex-col gap-4 rounded-2xl border bg-muted/30 p-4 sm:flex-row sm:items-center">
        <div className="text-sm">
          <h3 className="font-display font-bold text-foreground">Instructions</h3>
          <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-xs text-muted-foreground">
            <li>Take a video from the entrance of the facility.</li>
            <li>Walk in through the entrance, showing the key opening the door to the facility.</li>
            <li>The video must be taken by someone else while you walk in.</li>
            <li>The video must capture the signage of the place, matching the name you are using here.</li>
            <li>Upload the video on YouTube and share the link with us.</li>
          </ol>
        </div>
        <div className="relative h-[120px] w-full shrink-0 sm:w-[210px]">
          <Image
            src={"/places/2.png"}
            alt={"location verification example"}
            width={600}
            height={400}
            className="h-full w-full rounded-xl object-cover object-center"
          />
          <div className="absolute inset-0 flex h-full w-full items-center justify-center rounded-xl bg-black/30">
            <Play color="#FFFFFF99" fill="#FFFFFF99" size={40} />
          </div>
        </div>
      </div>
    </div>
  );
}
