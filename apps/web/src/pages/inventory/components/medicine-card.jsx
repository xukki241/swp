"use client";

import { useState } from "react";
import { Eye, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MedicinePlaceholder from "@/assets/medicine-placeholder.jpg";

export default function MedicineCard({ medicine, type, onViewDetails }) {
  const [showEyeIcon, setShowEyeIcon] = useState(false);

  const getDaysRemaining = () => {
    const expireDate = new Date(medicine.expireDate);
    const today = new Date();
    const diffTime = expireDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining();
  const isLowStock = type === "low-stock";
  const bgColor = isLowStock ? "bg-red-50" : "bg-yellow-50";

  return (
    <Card
      className={`${bgColor} shadow-sm rounded-lg border hover:shadow-md transition-shadow overflow-hidden group cursor-pointer`}
      onMouseEnter={() => setShowEyeIcon(true)}
      onMouseLeave={() => setShowEyeIcon(false)}
    >
      <CardContent className="p-0">
        {/* Medicine Image */}
        <div className="relative h-40 bg-gray-100 overflow-hidden">
          <img
            src={medicine.image_url || MedicinePlaceholder}
            alt={medicine.name}
            className="w-full h-full object-cover"
          />
          {/* Eye Icon on Hover */}
          {showEyeIcon && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onViewDetails(medicine)}
                className="rounded-full p-2 h-auto"
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Medicine Info */}
        <div className="p-4 space-y-3">
          <div>
            <h4 className="font-semibold text-sm text-gray-900 truncate">
              {medicine.name}
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              {medicine.brand}
            </p>
          </div>

          {isLowStock ? (
            <>
              {/* Low Stock Card Content */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Stock:</span>
                  <span className="font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {medicine.stock} units
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Zone:</span>
                  <span className="font-semibold">{medicine.zone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Rack:</span>
                  <span className="font-semibold">{medicine.rack}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Level:</span>
                  <span className="font-semibold">{medicine.level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Bin:</span>
                  <span className="font-semibold">{medicine.bin}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Expiry Card Content */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Manufacture:</span>
                  <span className="font-semibold">
                    {new Date(medicine.manufactureDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {new Date(medicine.expireDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Days Left:</span>
                  <span
                    className={`font-semibold ${
                      daysRemaining < 30
                        ? "text-red-600"
                        : daysRemaining < 90
                          ? "text-orange-600"
                          : "text-green-600"
                    }`}
                  >
                    {daysRemaining} days
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
