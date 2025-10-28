import { beforeEach, describe, expect, it, vi } from "vitest";

import { customerService } from "@/services/customerService.js";

vi.mock("@/db/index.js");

describe("customerService", () => {
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;
  });

  describe("create", () => {
    it("should create a single customer", async () => {
      const customerData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
      };

      const mockCustomer = { id: "cust-1", ...customerData };

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCustomer]),
        }),
      });

      const result = await customerService.create(customerData);

      expect(result).toEqual(mockCustomer);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should create multiple customers in batch", async () => {
      const customersData = [
        { name: "John Doe", email: "john@example.com", phone: "111" },
        { name: "Jane Doe", email: "jane@example.com", phone: "222" },
      ];

      const mockCustomers = [
        { id: "cust-1", ...customersData[0] },
        { id: "cust-2", ...customersData[1] },
      ];

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(mockCustomers),
        }),
      });

      const result = await customerService.create(customersData);

      expect(result).toEqual(mockCustomers);
      expect(result.length).toBe(2);
    });

    it("should return empty array for empty batch", async () => {
      const result = await customerService.create([]);

      expect(result).toEqual([]);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });
  });

  describe("getAll", () => {
    it("should get all customers without filters", async () => {
      const mockCustomers = [
        { id: "cust-1", name: "John Doe" },
        { id: "cust-2", name: "Jane Doe" },
      ];

      mockDb.query = {
        customers: {
          findMany: vi.fn().mockResolvedValue(mockCustomers),
        },
      };

      const result = await customerService.getAll();

      expect(result).toEqual(mockCustomers);
      expect(mockDb.query.customers.findMany).toHaveBeenCalled();
    });

    it("should filter customers by search term", async () => {
      const mockCustomers = [{ id: "cust-1", name: "John Doe" }];

      mockDb.query = {
        customers: {
          findMany: vi.fn().mockResolvedValue(mockCustomers),
        },
      };

      const result = await customerService.getAll({ search: "john" });

      expect(result).toEqual(mockCustomers);
      expect(mockDb.query.customers.findMany).toHaveBeenCalled();
    });

    it("should respect limit and offset", async () => {
      mockDb.query = {
        customers: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await customerService.getAll({ limit: 50, offset: 100 });

      expect(mockDb.query.customers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 50,
          offset: 100,
        })
      );
    });

    it("should use default limit and offset", async () => {
      mockDb.query = {
        customers: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await customerService.getAll();

      expect(mockDb.query.customers.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          limit: 100,
          offset: 0,
        })
      );
    });
  });

  describe("getById", () => {
    it("should get customer by ID with orders", async () => {
      const mockCustomer = {
        id: "cust-1",
        name: "John Doe",
        orders: [{ id: "order-1" }],
      };

      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(mockCustomer),
        },
      };

      const result = await customerService.getById("cust-1");

      expect(result).toEqual(mockCustomer);
      expect(mockDb.query.customers.findFirst).toHaveBeenCalled();
    });

    it("should return null if customer not found", async () => {
      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await customerService.getById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("should get customer by email", async () => {
      const mockCustomer = {
        id: "cust-1",
        email: "john@example.com",
        orders: [],
      };

      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(mockCustomer),
        },
      };

      const result = await customerService.getByEmail("john@example.com");

      expect(result).toEqual(mockCustomer);
    });

    it("should return null if email not found", async () => {
      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await customerService.getByEmail(
        "nonexistent@example.com"
      );

      expect(result).toBeNull();
    });
  });

  describe("getByPhone", () => {
    it("should get customer by phone", async () => {
      const mockCustomer = {
        id: "cust-1",
        phone: "1234567890",
        orders: [],
      };

      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(mockCustomer),
        },
      };

      const result = await customerService.getByPhone("1234567890");

      expect(result).toEqual(mockCustomer);
    });

    it("should return null if phone not found", async () => {
      mockDb.query = {
        customers: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await customerService.getByPhone("9999999999");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update customer", async () => {
      const updateData = { name: "John Updated" };
      const mockCustomer = { id: "cust-1", ...updateData };

      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([mockCustomer]),
          }),
        }),
      });

      const result = await customerService.update("cust-1", updateData);

      expect(result).toEqual(mockCustomer);
      expect(mockDb.update).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete customer without orders", async () => {
      const mockCustomer = { id: "cust-1", name: "John Doe" };

      mockDb.query = {
        salesOrders: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      mockDb.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockCustomer]),
        }),
      });

      const result = await customerService.delete("cust-1");

      expect(result).toEqual(mockCustomer);
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it("should throw error if customer has orders", async () => {
      mockDb.query = {
        salesOrders: {
          findMany: vi
            .fn()
            .mockResolvedValue([{ id: "order-1" }, { id: "order-2" }]),
        },
      };

      await expect(customerService.delete("cust-1")).rejects.toThrow(
        "Cannot delete customer. They have 2 sales order(s) associated with them."
      );

      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });
});
