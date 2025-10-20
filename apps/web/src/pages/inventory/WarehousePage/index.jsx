"use client";

import { useState, useEffect } from "react";
import { useWarehouse } from "../../../hooks/useWarehouse";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import ZoneDetailsCard from "./components/ZoneDetailsCard";
import { RackList } from "./components/RackList";
import { AppLayout } from "@/components/layouts/app-layout";

export default function WarehousePage() {
  const { zones, selectZone, selectedZone, racks, loading } = useWarehouse();
  const [selectedZoneId, setSelectedZoneId] = useState(null);

  function handleZoneChange(zoneId) {
    setSelectedZoneId(zoneId);
  }

  useEffect(() => {
    if (selectedZoneId) {
      selectZone(selectedZoneId);
    }
  }, [selectedZoneId]);

  return (
    <AppLayout>
      <div className="min-h-screenp-6 space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">
            Warehouse Management
          </h2>
          <p className="text-muted-foreground mt-1">
            View and manage warehouse zones, racks, and bins
          </p>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Zone Selection */}
          <Card className="shadow-md rounded-xl border-0">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                Select Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedZoneId || ""}
                onValueChange={handleZoneChange}
              >
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Choose a zone..." />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} ({zone.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Zone Details and Racks */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          )}

          {selectedZone ? (
            <div className="space-y-6">
              <ZoneDetailsCard zone={selectedZone} />
              <RackList racks={racks} />
            </div>
          ) : (
            <Card className="shadow-md rounded-xl border-0">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Select a zone to view its details and racks
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
