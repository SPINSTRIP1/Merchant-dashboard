import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";

const items = [
  {
    id: "Order 1012",
    item: {
      name: "Jollof Rice and Chicken",
      type: "Lunch",
      img: "/item.jpg",
    },
    quantity: 1,
    price: "15000",
    customer: {
      name: "Tobey Shang",
      img: "/avatar.jpg",
      email: "@tobeyshang",
    },
  },
  {
    id: "Order 1013",
    item: {
      name: "Jollof Rice and Chicken",
      type: "Lunch",
      img: "/item.jpg",
    },
    quantity: 1,
    price: "15000",
    customer: {
      name: "Tobey Shang",
      img: "/avatar.jpg",
      email: "@tobeyshang",
    },
  },
  {
    id: "Order 1014",
    item: {
      name: "Jollof Rice and Chicken",
      type: "Lunch",
      img: "/item.jpg",
    },
    quantity: 1,
    price: "15000",
    customer: {
      name: "Tobey Shang",
      img: "/avatar.jpg",
      email: "@tobeyshang",
    },
  },
];

export default function OrdersTable() {
  return (
    <div className="bg-foreground rounded-3xl p-5 mt-8">
      <Table>
        <TableHeader>
          <TableRow className="border-b-0">
            <TableHead className="w-[100px] text-primary-text font-bold text-base">
              Order ID
            </TableHead>
            <TableHead className="text-primary-text font-bold text-base">
              Item
            </TableHead>
            <TableHead className="text-primary-text font-bold text-base">
              Quantity
            </TableHead>
            <TableHead className="text-primary-text font-bold text-base">
              Price
            </TableHead>
            <TableHead className="text-primary-text font-bold text-base">
              Customer
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow className="border-b-0" key={item.id}>
              <TableCell className="min-w-[100px]">{item.id}</TableCell>
              <TableCell className="min-w-[200px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-3">
                    <Image
                      src={item.item.img}
                      className="w-full object-cover h-full"
                      width={40}
                      height={40}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{item.item.name}</p>
                    <p className="text-xs">{item.item.type}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>
                <div className="flex flex-shrink-0 flex-1 items-center mb-4">
                  <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center mr-3">
                    <Image
                      src={item.customer.img}
                      className="w-full object-cover h-full"
                      width={40}
                      height={40}
                      alt="avatar"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold">{item.customer.name}</p>
                    <p className="text-xs text-secondary-text">
                      {item.customer.email}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
