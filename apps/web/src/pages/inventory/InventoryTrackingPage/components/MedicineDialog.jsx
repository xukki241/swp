import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import MedicationPlaceholder from "../../../../assets/medicine-placeholder.jpg";

const MedicineDialog = ({ medicine, open, onOpenChange, highlight }) => {
  if (!medicine) return null;

  const isLowStock = highlight === "stock";
  const isExpiring = highlight === "expireDate";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{medicine?.medicationVariant?.name}</DialogTitle>
          <DialogDescription>
            {medicine?.medicationVariant?.medication?.brand}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-center">
            <img
              src={medicine?.image_url || MedicationPlaceholder}
              alt={medicine?.medicationVariant?.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="font-semibold">Batch Number:</span>{" "}
              {medicine?.batchNumber}
            </div>
            <div>
              <span className="font-semibold">Price: </span>
              {medicine?.medicationVariant?.sellPrice} VND
            </div>
            <div>
              <span className="font-semibold">Manufacture Date:</span>{" "}
              {new Date(medicine.manufactureDate).toLocaleDateString()}
            </div>
            <div
              className={`flex items-center ${isExpiring ? "text-red-500" : ""}`}
            >
              <span className="font-semibold">Expire Date:</span>&nbsp;
              {new Date(medicine.expireDate).toLocaleDateString()}
              {isExpiring && <AlertTriangle className="w-4 h-4 ml-2" />}
            </div>
            <div
              className={`flex items-center ${isLowStock ? "text-red-500" : ""}`}
            >
              <span className="font-semibold">Stock:</span>&nbsp;
              {medicine?.quantity}
              {isLowStock && <AlertTriangle className="w-4 h-4 ml-2" />}
            </div>
            <div>
              <span className="font-semibold">Location:</span>{" "}
              {`Zone: ${medicine?.bin?.rack?.zone?.name}, Rack: ${medicine?.bin?.rack.name}, Level: ${medicine?.bin?.level}, Bin ${medicine?.bin?.name}`}
            </div>
          </div>
          {medicine.isPrescription && <Badge>Prescription Required</Badge>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicineDialog;
