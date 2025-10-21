"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { customerService } from "@/services/customerService";
import { toast } from "sonner";

export default function CustomerSelector({ onSelectCustomer }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (term) => {
    setSearchTerm(term);

    if (!term.trim()) {
      setCustomers([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await customerService.getCustomers({
        search: term,
      });

      // Handle different response formats
      let data = response.data || response;
      if (data.data) {
        data = data.data;
      }

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("[v0] Customer search error:", error);
      toast.error("Unable to search customers");
      setCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search existing customers..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        </div>
      )}

      {customers.length > 0 && (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {customers.map((customer) => (
            <Button
              key={customer.id}
              variant="outline"
              onClick={() => onSelectCustomer(customer)}
              className="w-full justify-start text-left h-auto py-3"
            >
              <div>
                <p className="font-semibold text-gray-900">{customer.name}</p>
                {customer.phone && (
                  <p className="text-xs text-gray-600">{customer.phone}</p>
                )}
              </div>
            </Button>
          ))}
        </div>
      )}

      {searchTerm && customers.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500 text-center py-4">
          No customers found
        </p>
      )}
    </div>
  );
}
