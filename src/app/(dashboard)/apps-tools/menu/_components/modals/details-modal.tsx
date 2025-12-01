import { Button } from "@/components/ui/button";
import { Menu } from "../../_schemas";
import Image from "next/image";
import MenuStatusBadge from "../menu-status-badge";
import { formatAmount } from "@/utils";

interface DetailsModalProps {
  menu: Menu | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (menu: Menu) => void;
}

export default function DetailsModal({
  isOpen,
  menu,
  onClose,
  onEdit,
}: Readonly<DetailsModalProps>) {
  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={
          "bg-foreground rounded-3xl p-3 lg:p-4 shadow-xl w-full max-h-[90vh] max-w-[760px] overflow-y-auto"
        }
      >
        <div className="md:flex grid grid-cols-2 gap-5 items-center overflow-x-auto ">
          {menu?.images?.map((img, index) => (
            <div
              key={index}
              className="w-full h-[150px] md:w-[253px] md:h-[206px] rounded-lg overflow-hidden"
            >
              <Image
                src={img}
                width={253}
                height={206}
                alt="Images"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-x-3 mt-3 mb-1">
          <h2 className="text-2xl text-primary-text font-bold">{menu.name}</h2>
          <p>{menu.tag}</p>
          <MenuStatusBadge status={menu.status} />
        </div>
        <h3 className="font-bold text-lg text-primary-text">
          {formatAmount(menu.price)}
        </h3>
        <p>{menu.description}</p>
        <div className="flex gap-x-2 w-full mt-4 items-center justify-center">
          <Button
            onClick={onClose}
            className="w-full"
            size={"lg"}
            variant={"secondary"}
          >
            Cancel
          </Button>
          <Button onClick={() => onEdit(menu)} className="w-full" size={"lg"}>
            Edit Item
          </Button>
        </div>
      </div>
    </div>
  );
}
