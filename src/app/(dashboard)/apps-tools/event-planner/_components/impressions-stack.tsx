import Image from "next/image";

const avatars = [
  "/avatars/1.jpg",
  "/avatars/2.jpg",
  "/avatars/3.jpg",
  "/avatars/4.jpg",
];

interface ImpressionsStackProps {
  impressions: number;
}

export default function ImpressionsStack({
  impressions,
}: ImpressionsStackProps) {
  if (impressions === 0) {
    return (
      <div className="bg-background-light w-fit rounded-3xl px-1.5 py-1">
        <p className="text-[10px] text-secondary-text">No views yet</p>
      </div>
    );
  }

  const displayCount = Math.min(impressions, 4);
  const remaining = impressions - 4;

  const formatRemaining = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="flex items-center gap-x-2">
      <div className="flex items-center">
        {avatars.slice(0, displayCount).map((avatar, index) => (
          <div
            key={index}
            className={`border-2 rounded-full overflow-hidden border-white ${
              index > 0 ? "-ml-1" : ""
            }`}
          >
            <Image
              src={avatar}
              alt="avatar"
              width={40}
              height={40}
              className="w-5 h-5 object-cover"
            />
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <div className="bg-background-light rounded-3xl px-1.5 py-1">
          <p className="text-[10px] text-secondary-text uppercase">
            +{formatRemaining(remaining)} others
          </p>
        </div>
      )}
    </div>
  );
}
