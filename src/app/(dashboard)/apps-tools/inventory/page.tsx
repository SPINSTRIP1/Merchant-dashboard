import { InventoryFormProvider } from "./_context";
import Inventory from "./client-page";

export default function Page() {
  return (
    <InventoryFormProvider>
      <Inventory />
    </InventoryFormProvider>
  );
}
