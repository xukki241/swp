import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useInventory } from "@/hooks/useInventory";
import MedicineCard from "./components/MedicineCard";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layouts/app-layout";
import { Card } from "@/components/ui/card";

const InventoryTracking = () => {
  const {
    lowStock,
    expiring,
    loading,
    error,
    refetchLowStock,
    refetchExpiring,
  } = useInventory();

  function renderLowStock() {
    if (loading.lowStock) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      );
    }

    if (error.lowStock) {
      return (
        <div className="text-red-500">Failed to load low stock items.</div>
      );
    }

    if (lowStock.length === 0) {
      return <div className="text-red-500">No low-stock items yet.</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {lowStock.map((item) => (
          <MedicineCard key={item.id} medicine={item} variant="low-stock" />
        ))}
      </div>
    );
  }

  function renderExpiring() {
    if (loading.expiring) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      );
    }

    if (error.expiring) {
      return <div className="text-red-500">Failed to load expiring items.</div>;
    }

    if (expiring.length === 0) {
      return <div className="text-red-500">No expiring items yet.</div>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {expiring.map((item) => (
          <MedicineCard key={item.id} medicine={item} variant="expiring" />
        ))}
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screenp-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Inventory Tracking
            </h2>
            <p className="text-muted-foreground mt-1">
              View low-stock and near expiry items
            </p>
          </div>
          <Button className="w-50">Create Purchase Order</Button>
        </div>
        <Card className="relative shadow-md rounded-xl border-0 p-6">
          <Accordion
            type="multiple"
            defaultValue={["low-stock", "expiry-tracking"]}
            className="w-full"
          >
            <AccordionItem value="low-stock">
              <AccordionTrigger>Low Stock Tracking</AccordionTrigger>
              <AccordionContent>{renderLowStock()}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="expiry-tracking">
              <AccordionTrigger>Expiry Tracking</AccordionTrigger>
              <AccordionContent>{renderExpiring()}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InventoryTracking;
