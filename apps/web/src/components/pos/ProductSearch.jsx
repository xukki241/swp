"use client";

import { useState } from "react";
import { Search, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { medicationService } from "@/services/medicationService";
import { toast } from "sonner";

export function ProductSearch({ onAddToCart }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [medications, setMedications] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setMedications([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await medicationService.searchMedications(searchQuery);
      setMedications(response.data || []);
    } catch (error) {
      toast.error("Failed to search medications");
    } finally {
      setIsSearching(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Products</h3>

        <div className="flex gap-2">
          <Input
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {medications.length > 0 && (
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {medications.map((medication) => (
              <div
                key={medication.id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{medication.name}</p>
                    <p className="text-sm text-muted-foreground">
                      SKU: {medication.sku}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-sm font-semibold text-primary">
                        {formatPrice(medication.sellPrice)}
                      </p>
                      <Badge
                        variant={
                          medication.availableQuantity > 0
                            ? "default"
                            : "destructive"
                        }
                      >
                        Stock: {medication.availableQuantity || 0}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onAddToCart(medication);
                    setSearchQuery("");
                    setMedications([]);
                  }}
                  disabled={!medication.availableQuantity}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}

        {searchQuery && medications.length === 0 && !isSearching && (
          <p className="text-center text-sm text-muted-foreground">
            No medications found
          </p>
        )}
      </div>
    </Card>
  );
}
