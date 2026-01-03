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
    <div className="space-y-7 py-5">
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
      <div className="flex gap-x-10 items-center">
        <div className="text-sm">
          <h3 className="font-bold text-primary-text">Instruction</h3>
          <p className=" text-secondary-text">
            1.⁠ ⁠Take a video from the entrance of the facility. <br />
            2.⁠ ⁠Walk in through the entrance of the facility showing that the
            key is opening the door to the facility.
            <br /> 3.⁠ ⁠The video must be taken by someone else while you walk
            in. <br />
            4.⁠ ⁠Video must capture the signage of the place which must match
            the name you are using to create a place here. 5.Upload the video on
            youtube and share the link with us.
          </p>
        </div>
        <div className="h-[120px] flex-shrink-0 relative w-[210px]">
          <Image
            src={"/places/2.png"}
            alt={"location verification example"}
            width={600}
            height={400}
            className="w-full h-full rounded-lg object-cover object-center"
          />
          <div className="absolute inset-0 flex rounded-lg items-center justify-center h-full w-full bg-[#0000004D]">
            <Play color="#FFFFFF99" fill="#FFFFFF99" size={48} />
          </div>
        </div>
      </div>
    </div>
  );
}
