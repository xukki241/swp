import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerService } from "@/services/customerService";
import { Edit, Loader2, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import EditCustomerForm from "./EditCustomerForm";

export default function CustomerSelector({ onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState(null);

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setCustomers([]);
      setEditingCustomerId(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await customerService.getCustomers({
        search: term,
      });

      let data = response.data || response;
      if (data.data) {
        data = data.data;
      }

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[v0] Customer search error:", error);
      toast.error("Không thể tìm kiếm khách hàng");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (e, customerId) => {
    e.stopPropagation();
    setEditingCustomerId(customerId);
  };

  const handleEditSuccess = (updatedCustomer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updatedCustomer.id ? updatedCustomer : c))
    );
  };

  const handleEditCancel = () => {
    setEditingCustomerId(null);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm kiếm khách hàng hiện có..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-500">Đang tìm kiếm...</span>
        </div>
      )}

      {customers.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {customers.map((customer) => (
            <div key={customer.id} className="space-y-2">
              {editingCustomerId === customer.id ? (
                <EditCustomerForm
                  customer={customer}
                  onClose={handleEditCancel}
                  onSuccess={handleEditSuccess}
                />
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => onSelectCustomer(customer)}
                    className="flex-1 justify-start text-left h-auto py-3"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {customer.name}
                      </p>
                      {customer.phone && (
                        <p className="text-xs text-gray-600">
                          SĐT: {customer.phone}
                        </p>
                      )}
                      {customer.email && (
                        <p className="text-xs text-blue-600">
                          Email: {customer.email}
                        </p>
                      )}
                    </div>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleEditClick(e, customer.id)}
                    className="shrink-0 h-auto"
                    title="Chỉnh sửa thông tin khách hàng"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {searchTerm && customers.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500 text-center py-4">
          Không tìm thấy khách hàng nào
        </p>
      )}
    </div>
  );
}
