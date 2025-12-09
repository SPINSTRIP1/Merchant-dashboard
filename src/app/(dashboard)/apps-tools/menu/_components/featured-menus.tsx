import { useServerPagination } from "@/hooks/use-server-pagination";
import React from "react";
import { Menu } from "../_schemas";
import { MENU_QUERY_KEY } from "../_constants";
import { MENUS_SERVER_URL } from "@/constants";
import EmptyState from "@/components/empty-state";
import { Star } from "lucide-react";
import ItemCard from "@/app/(dashboard)/_components/item-card";

export default function FeaturedMenus({
  onDeleteClick,
  onEditClick,
}: {
  onDeleteClick?: (menu: Menu) => void;
  onEditClick?: (menu: Menu) => void;
}) {
  const { items, isLoading } = useServerPagination<Menu>({
    queryKey: MENU_QUERY_KEY,
    endpoint: `${MENUS_SERVER_URL}/menu-items`,
    filters: {
      isFeatured: true,
    },
  });
  return (
    <div>
      <h2 className="font-bold text-primary-text text-sm">Featured Menus</h2>
      <div className="flex gap-4">
        {isLoading ? (
          <div className="flex gap-4 mb-5 w-full">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="w-full max-w-[286px] h-[178px] bg-neutral-accent rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Star className="h-16 w-16 text-primary" />}
            title="No Featured Menus"
            description="You don't have any featured menu items yet. Featured menus will appear here."
          />
        ) : (
          items
            .slice(0, 4)
            .map((menu, index) => (
              <ItemCard
                key={index}
                menu={menu}
                onDelete={onDeleteClick}
                onEdit={onEditClick}
              />
            ))
        )}
      </div>
    </div>
  );
}
