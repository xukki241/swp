"use client";
import { BinCard } from "./BinCard";

export function BinGrid({ rackId, bins, refetch }) {
  if (!bins || bins.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No bins in this rack</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {bins.map((bin) => (
        <BinCard key={bin.id} bin={bin} rackId={rackId} refetch={refetch} />
      ))}
    </div>
  );
}
