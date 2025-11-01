import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function FilterDropdown({
  label,
  filterType,
  value,
  onSave,
  onCancel,
  options = [],
  isActive = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    onCancel();
    setIsOpen(false);
  };

  const renderContent = () => {
    switch (filterType) {
      case "range":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1">Min</Label>
              <Input
                type="number"
                placeholder="Min"
                value={tempValue.min || ""}
                onChange={(e) =>
                  setTempValue({ ...tempValue, min: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs mb-1">Max</Label>
              <Input
                type="number"
                placeholder="Max"
                value={tempValue.max || ""}
                onChange={(e) =>
                  setTempValue({ ...tempValue, max: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        );

      case "dateRange":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-xs mb-1">From</Label>
              <Input
                type="date"
                value={tempValue.from || ""}
                onChange={(e) =>
                  setTempValue({ ...tempValue, from: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs mb-1">To</Label>
              <Input
                type="date"
                value={tempValue.to || ""}
                onChange={(e) =>
                  setTempValue({ ...tempValue, to: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        );

      case "multiSelect":
        return (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {options.map((option) => (
              <div key={option.id} className="flex items-center gap-2">
                <Checkbox
                  id={option.id}
                  checked={tempValue.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setTempValue([...tempValue, option]);
                    } else {
                      setTempValue(tempValue.filter((v) => v !== option));
                    }
                  }}
                />
                <label
                  htmlFor={option.id}
                  className="text-sm cursor-pointer flex-1"
                >
                  {option.name}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={isActive ? "default" : "outline"}
          className={cn(
            "gap-2 justify-between",
            isActive && "bg-primary text-primary-foreground"
          )}
        >
          {label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 mt-2">
        <div className="space-y-4">
          <div>{renderContent()}</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} className="flex-1">
              Save
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
