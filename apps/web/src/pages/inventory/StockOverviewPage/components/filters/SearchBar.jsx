import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function SearchBar({ searchValue, onSearchChange, onSearch }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-2 items-end">
      <div className="flex-1">
        <label className="text-sm font-medium text-foreground mb-2 block">
          Search
        </label>
        <Input
          placeholder="Search medicines by name..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="w-full"
        />
      </div>
      <Button onClick={onSearch} className="gap-2">
        <Search className="h-4 w-4" />
        Search
      </Button>
    </div>
  );
}
