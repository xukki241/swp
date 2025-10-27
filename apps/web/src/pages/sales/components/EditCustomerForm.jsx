"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { customerService } from "@/services/customerService";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EditCustomerForm({ customer, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: customer.name || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            toast.error("Customer name is required");
            return;
        }

        if (!formData.phone.trim()) {
            toast.error("Phone number is required");
            return;
        }

        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error("Invalid email format");
            return;
        }

        setIsSubmitting(true);

        try {
            const updateData = {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
            };

            // Only include email if it has a value
            const trimmedEmail = formData.email.trim();
            if (trimmedEmail) {
                updateData.email = trimmedEmail;
            }

            // Only include address if it has a value
            const trimmedAddress = formData.address.trim();
            if (trimmedAddress) {
                updateData.address = trimmedAddress;
            }

            const response = await customerService.updateCustomer(customer.id, updateData);

            const updatedCustomer = response.data || response;
            toast.success("Customer updated successfully!");
            onSuccess(updatedCustomer);
            onClose();
        } catch (error) {
            console.error("Update customer error:", error);

            let message = "Failed to update customer";
            if (error?.response?.data?.error) {
                const errorData = error.response.data.error;
                if (typeof errorData === "object" && errorData.message) {
                    message = errorData.message;
                } else if (typeof errorData === "string") {
                    message = errorData;
                }
            } else if (error?.response?.data?.message) {
                message = error.response.data.message;
            } else if (error?.message) {
                message = error.message;
            }

            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Edit Customer Information</h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="edit-name" className="text-sm font-medium">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="edit-name"
                        placeholder="Enter customer name"
                        value={formData.name}
                        onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="edit-phone" className="text-sm font-medium">
                        Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="edit-phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                    />
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="edit-email" className="text-sm font-medium">
                        Email (Optional)
                    </Label>
                    <Input
                        id="edit-email"
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-muted-foreground">
                        Invoice will be sent to this email if provided
                    </p>
                </div>

                <div className="space-y-1.5">
                    <Label htmlFor="edit-address" className="text-sm font-medium">
                        Address (Optional)
                    </Label>
                    <Input
                        id="edit-address"
                        placeholder="Enter address"
                        value={formData.address}
                        onChange={(e) =>
                            setFormData({ ...formData, address: e.target.value })
                        }
                        disabled={isSubmitting}
                    />
                </div>

                <div className="flex gap-2 pt-2">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
