import Dropdown from "@/components/dropdown";
import { useServerPagination } from "@/hooks/use-server-pagination";
import React from "react";
import { Menu } from "../_schemas";
import { MENU_QUERY_KEY } from "../_constants";
import { MENUS_SERVER_URL, months } from "@/constants";
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
  const { items } = useServerPagination<Menu>({
    queryKey: MENU_QUERY_KEY,
    endpoint: `${MENUS_SERVER_URL}/menu-items`,
    filters: {
      isFeatured: true,
    },
  });
  return (
    <div>
      <Dropdown header="Featured Menus" options={months} placeholder="July" />
      <div className="flex gap-4">
        {items.length === 0 ? (
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
