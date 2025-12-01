import { Menu } from "../apps-tools/menu/_schemas";

export interface ItemCardProps {
  menu: Menu;
  isEditing?: boolean;
  onDelete?: (e: Menu) => void;
  onEdit?: (e: Menu) => void;
}
