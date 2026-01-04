import Image from "next/image";
import { X } from "lucide-react";

export interface MediaImageProps {
  imageUrl: string;
  index: number;
  id: string;
  onRemove: (index: number, id: string) => void;
}

export const MediaImage = ({
  imageUrl,
  index,
  onRemove,
  id,
}: MediaImageProps) => (
  <div className="relative w-[158px] h-[169px]">
    <Image
      src={imageUrl}
      alt={`Product image ${index + 1}`}
      fill
      className="object-cover rounded-2xl border border-neutral-accent"
    />
    <button
      type="button"
      onClick={() => onRemove(index, id)}
      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors z-10"
    >
      <X size={16} />
    </button>
  </div>
);
