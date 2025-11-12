import { AppLayout } from "@/components/layouts/app-layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/hooks/useAuth";
import { useInventory } from "@/hooks/useInventory";
import { useEffect, useState } from "react";
import MedicineCard from "./components/MedicineCard";

const InventoryTracking = () => {
  const { lowStock, expiring, loading, error } = useInventory();
  const [canEdit, setCanEdit] = useState(false);
  const { data } = useCurrentUser();

  useEffect(() => {
    if (data?.user?.role === "owner") {
      setCanEdit(true);
    }
  }, [data]);

  function renderLowStock() {
    if (loading.lowStock) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      );
    }

    if (error.lowStock) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 font-medium">
            Không thể tải các mặt hàng tồn kho thấp.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng thử lại sau.
          </p>
        </div>
      );
    }

    if (lowStock.length === 0) {
      return (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground text-lg">
            Không tìm thấy mặt hàng tồn kho thấp
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tất cả mặt hàng đều trên ngưỡng 250 đơn vị
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {lowStock.map((item) => (
          <MedicineCard key={item.id} medicine={item} variant="low-stock" />
        ))}
      </div>
    );
  }

  function renderExpiring() {
    if (loading.expiring) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      );
    }

    if (error.expiring) {
      return (
        <div className="text-center py-8">
          <p className="text-red-500 font-medium">
            Không thể tải các mặt hàng sắp hết hạn.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Vui lòng thử lại sau.
          </p>
        </div>
      );
    }

    if (expiring.length === 0) {
      return (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground text-lg">
            Không tìm thấy mặt hàng sắp hết hạn
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Tất cả mặt hàng có ngày hết hạn sau 30 ngày
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <h2 className="text-3xl font-bold text-gray-900">Theo dõi Kho</h2>
            <p className="text-muted-foreground mt-1">
              Xem các mặt hàng tồn kho thấp và sắp hết hạn
            </p>
          </div>
          {canEdit && <Button className="w-50">Tạo Đơn Mua Hàng</Button>}
        </div>
        <Card className="relative shadow-md rounded-xl border-0 p-6">
          <Accordion
            type="multiple"
            defaultValue={["low-stock", "expiry-tracking"]}
            className="w-full"
          >
            <AccordionItem value="low-stock">
              <AccordionTrigger className="text-lg">
                Theo dõi Tồn Kho Thấp
              </AccordionTrigger>
              <AccordionContent>{renderLowStock()}</AccordionContent>
            </AccordionItem>
            <AccordionItem value="expiry-tracking">
              <AccordionTrigger className="text-lg">
                Theo dõi Hết Hạn
              </AccordionTrigger>
              <AccordionContent>{renderExpiring()}</AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>
    </AppLayout>
  );
};

export default InventoryTracking;
