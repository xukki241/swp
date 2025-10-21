"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerService } from "@/services/customerService";
import { Plus, Search, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function CustomerSelector({ selectedCustomer, onSelectCustomer }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Search customers
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCustomers([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await customerService.getCustomers({
        search: searchQuery,
        limit: 10,
      });
      setCustomers(response.data || []);
    } catch (error) {
      toast.error("Failed to search customers");
    } finally {
      setIsSearching(false);
    }
  };

  // Create new customer
  const handleCreateCustomer = async (e) => {
    e.preventDefault();

    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    try {
      const response = await customerService.createCustomer(newCustomer);
      const createdCustomer = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      toast.success("Customer created successfully");
      onSelectCustomer(createdCustomer);
      setShowNewCustomerDialog(false);
      setNewCustomer({ name: "", email: "", phone: "", address: "" });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to create customer";
      toast.error(errorMessage);
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Customer</h3>
          <Dialog
            open={showNewCustomerDialog}
            onOpenChange={setShowNewCustomerDialog}
          >
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                New Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateCustomer} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    placeholder="Customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, email: e.target.value })
                    }
                    placeholder="customer@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, phone: e.target.value })
                    }
                    placeholder="0901234567"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) =>
                      setNewCustomer({
                        ...newCustomer,
                        address: e.target.value,
                      })
                    }
                    placeholder="Customer address"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Customer
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {selectedCustomer ? (
          <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">{selectedCustomer.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedCustomer.phone ||
                    selectedCustomer.email ||
                    "No contact"}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSelectCustomer(null)}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {customers.length > 0 && (
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-2">
                {customers.map((customer) => (
                  <button
                    key={customer.id}
                    onClick={() => {
                      onSelectCustomer(customer);
                      setCustomers([]);
                      setSearchQuery("");
                    }}
                    className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
                  >
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.phone || customer.email || "No contact"}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
