import Image from "next/image";
import React from "react";

export default function ImageGallery({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-4 my-3 gap-4">
      {images.slice(0, 3).map((img, index) => (
        <div
          key={index}
          className="w-full h-[206px] bg-neutral-accent rounded-xl overflow-hidden"
        >
          <Image
            width={400}
            height={400}
            src={img}
            alt={`Image ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      {images.length > 3 && (
        <div className="w-full relative h-[206px] bg-neutral-accent rounded-xl overflow-hidden flex items-center justify-center text-white text-lg font-medium">
          <Image
            width={400}
            height={400}
            src={images[3]}
            alt={`Image 4`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
            + {images.length - 3}
          </div>
        </div>
      )}
    </div>
  );
}
