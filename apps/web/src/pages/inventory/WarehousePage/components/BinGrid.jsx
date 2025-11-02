"use client";

import { BinCard } from "./BinCard";

export function BinGrid({ rackId, bins }) {
  if (!bins || bins.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No bins in this rack</p>
      </div>
    );
  }

  // Calculate grid dimensions
  const maxLevel = Math.max(...bins.map((bin) => bin.level || 0));
  const maxNumber = Math.max(...bins.map((bin) => bin.number || 0));

  // Create a 2D grid structure
  const grid = Array.from({ length: maxLevel }, () =>
    Array.from({ length: maxNumber }, () => null)
  );

  // Populate the grid with bins
  bins.forEach((bin) => {
    if (bin.level && bin.number) {
      grid[bin.level - 1][bin.number - 1] = bin;
    }
  });

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground mb-4">
        Grid Layout: {maxLevel} Levels × {maxNumber} Columns
      </div>
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Column headers */}
          <div className="flex gap-2 mb-2">
            <div className="w-12" />
            {Array.from({ length: maxNumber }, (_, i) => (
              <div
                key={i}
                className="w-16 flex items-center justify-center text-xs font-medium text-muted-foreground"
              >
                {numberToColumn(i + 1)}
              </div>
            ))}
          </div>
          {grid.map((row, levelIndex) => (
            <div key={levelIndex} className="flex gap-2 mb-2">
              <div className="w-12 flex items-center justify-center text-sm font-medium text-muted-foreground">
                L{levelIndex + 1}
              </div>
              {row.map((bin, numberIndex) => (
                <BinCard
                  key={`${levelIndex}-${numberIndex}`}
                  bin={bin}
                  level={levelIndex + 1}
                  number={numberIndex + 1}
                  rackId={rackId}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Convert number to column letter (1 = A, 2 = B, ..., 27 = AA, 28 = AB, ...)
function numberToColumn(num) {
  let result = "";
  while (num > 0) {
    const remainder = (num - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    num = Math.floor((num - 1) / 26);
  }
  return result;
}
