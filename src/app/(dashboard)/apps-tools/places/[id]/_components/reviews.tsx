import EmptyState from "@/components/empty-state";

export default function Reviews() {
  return (
    <EmptyState
      // icon={<MapPin className="h-16 w-16 text-primary" />}
      title="No Reviews"
      description={"No reviews available for this place yet"}
    />
  );
}
