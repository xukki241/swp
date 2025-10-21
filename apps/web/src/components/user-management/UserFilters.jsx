import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

/**
 * User filters and search component
 * @param {Object} props
 * @param {string} props.searchInput - Current search input value
 * @param {Function} props.onSearchInputChange - Handler for search input change
 * @param {string} props.appliedSearch - Currently applied search query
 * @param {Function} props.onSearchSubmit - Handler for search form submit
 * @param {Function} props.onClearFilters - Handler for clearing all filters
 * @param {string} props.statusFilter - Current status filter
 * @param {Function} props.onStatusFilterChange - Handler for status filter change
 * @param {string} props.roleFilter - Current role filter
 * @param {Function} props.onRoleFilterChange - Handler for role filter change
 */
export function UserFilters({
  searchInput,
  onSearchInputChange,
  appliedSearch,
  onSearchSubmit,
  onClearFilters,
  statusFilter,
  onStatusFilterChange,
  roleFilter,
  onRoleFilterChange,
}) {
  const hasActiveFilters =
    appliedSearch || statusFilter !== "all" || roleFilter !== "all";

  return (
    <form
      onSubmit={onSearchSubmit}
      className="mb-6 flex flex-col gap-4 md:flex-row"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, or phone..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          className="pl-10 h-11 rounded-lg"
        />
      </div>

      <Button type="submit" className="h-11 bg-primary/90 hover:bg-primary">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={onClearFilters}
        >
          Clear All
        </Button>
      )}

      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full md:w-[180px] h-11">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select>

      <Select value={roleFilter} onValueChange={onRoleFilterChange}>
        <SelectTrigger className="w-full md:w-[180px] h-11">
          <SelectValue placeholder="Filter by role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Roles</SelectItem>
          <SelectItem value="owner">Owner</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </SelectContent>
      </Select>
    </form>
  );
}
