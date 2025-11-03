import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, X } from "lucide-react";

export function MedicationFilters({
  searchInput,
  onSearchInputChange,
  statusFilter,
  onStatusFilterChange,
  onSearchSubmit,
  onClearFilters,
  onAddClick,
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Ngừng hoạt động</SelectItem>
            </SelectContent>
          </Select>

          <Input
            className="w-64"
            placeholder="Tìm theo tên hoặc thương hiệu…"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit">
            <Search className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
          <Button type="button" variant="outline" onClick={onClearFilters}>
            <X className="w-4 h-4 mr-1" />
            Xóa bộ lọc
          </Button>
        </div>
      </form>

      <div className="flex gap-2">
        <Button onClick={onAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mới
        </Button>
      </div>
    </div>
  );
}
