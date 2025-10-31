import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Eye } from "lucide-react";
import { useState } from "react";
import MedicineDialog from "./MedicineDialog";

const MedicineCard = ({ medicine = {}, variant }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const cardClass = cn(
    "relative group cursor-pointer gap-4 py-4 justify-between max-w-60",
    {
      "bg-red-100 dark:bg-red-900/30": variant === "low-stock",
      "bg-yellow-100 dark:bg-yellow-900/30": variant === "expiring",
    }
  );

  const daysRemaining = Math.ceil(
    (new Date(medicine.expireDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <Card className={cardClass} onClick={() => setIsDialogOpen(true)}>
        <CardHeader>
          <div className="flex justify-center mb-2">
            <img
              src={medicine?.image_url || MedicinePlaceholder}
              alt={medicine?.name}
              className="w-24 h-24 object-cover rounded-md"
            />
          </div>
          <CardTitle className="text-center text-lg">
            {medicine?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {variant === "low-stock" ? (
            <div className="text-center">
              <p className="text-sm text-gray-500">Stock</p>
              <p className="text-2xl font-bold">{medicine?.stock}</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-500">Expires in</p>
              <p className="text-2xl font-bold">{daysRemaining} days</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 justify-center">
          {`Zone ${medicine?.zone}, Rack ${medicine?.rack}, Level ${medicine?.level}, Bin ${medicine?.bin}`}
        </CardFooter>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Eye className="w-5 h-5 text-gray-600" />
        </div>
      </Card>
      <MedicineDialog
        medicine={medicine}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        highlight={variant === "low-stock" ? "stock" : "expireDate"}
      />
    </>
  );
};

export default MedicineCard;
