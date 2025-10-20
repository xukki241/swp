"use client";

import { useState } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { RackItem } from "./rack-item";

export function RackList({ racks }) {
  const [expandedRacks, setExpandedRacks] = useState(new Set());

  const toggleRack = (rackId) => {
    const newExpanded = new Set(expandedRacks);
    if (newExpanded.has(rackId)) {
      newExpanded.delete(rackId);
    } else {
      newExpanded.add(rackId);
    }
    setExpandedRacks(newExpanded);
  };

  const collapseAll = () => {
    setExpandedRacks(new Set());
  };

  if (!racks || racks.length === 0) {
    return (
      <Card className="shadow-md rounded-xl border-0">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No racks found in this zone</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Racks</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={collapseAll}
          disabled={expandedRacks.size === 0}
        >
          Collapse All
        </Button>
      </div>

      <div className="space-y-3">
        {racks.map((rack) => (
          <RackItem
            key={rack.id}
            rack={rack}
            isExpanded={expandedRacks.has(rack.id)}
            onToggle={() => toggleRack(rack.id)}
          />
        ))}
      </div>
    </div>
  );
}
