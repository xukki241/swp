import { beforeEach, describe, expect, it, vi } from "vitest";

import { customerController } from "@/controllers/customerController.js";
import { customerService } from "@/services/customerService.js";

vi.mock("@/services/customerService.js");

describe("CustomerController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a single customer successfully", async () => {
      const customerData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "0123456789",
      };
      const mockCustomer = { id: "1", ...customerData };

      req.body = customerData;
      customerService.getByEmail.mockResolvedValue(null);
      customerService.getByPhone.mockResolvedValue(null);
      customerService.create.mockResolvedValue(mockCustomer);

      await customerController.create(req, res);

      expect(customerService.create).toHaveBeenCalledWith(customerData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer created successfully",
        data: mockCustomer,
      });
    });

    it("should create batch customers successfully", async () => {
      const customersData = [
        { name: "John Doe", email: "john@example.com" },
        { name: "Jane Doe", email: "jane@example.com" },
      ];
      const mockCustomers = [
        { id: "1", ...customersData[0] },
        { id: "2", ...customersData[1] },
      ];

      req.body = customersData;
      customerService.create.mockResolvedValue(mockCustomers);

      await customerController.create(req, res);

      expect(customerService.create).toHaveBeenCalledWith(customersData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customers created successfully",
        data: mockCustomers,
      });
    });

    it("should return 400 if name is missing", async () => {
      req.body = { email: "test@example.com" };

      await customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Tên khách hàng là bắt buộc",
        },
      });
    });

    it("should return 400 if name is empty", async () => {
      req.body = { name: "   ", email: "test@example.com" };

      await customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Tên khách hàng là bắt buộc",
        },
      });
    });

    it("should return 409 if email already exists", async () => {
      const customerData = {
        name: "John Doe",
        email: "existing@example.com",
      };
      const existingCustomer = {
        id: "1",
        name: "Existing",
        email: "existing@example.com",
      };

      req.body = customerData;
      customerService.getByEmail.mockResolvedValue(existingCustomer);

      await customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Khách hàng với email 'existing@example.com' đã tồn tại",
        },
      });
    });

    it("should return 409 if phone already exists", async () => {
      const customerData = {
        name: "John Doe",
        phone: "0123456789",
      };
      const existingCustomer = {
        id: "1",
        name: "Existing",
        phone: "0123456789",
      };

      req.body = customerData;
      customerService.getByPhone.mockResolvedValue(existingCustomer);

      await customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Khách hàng với số điện thoại '0123456789' đã tồn tại",
        },
      });
    });

    it("should skip email check if email is empty string", async () => {
      const customerData = {
        name: "John Doe",
        email: "   ",
      };
      const mockCustomer = { id: "1", ...customerData };

      req.body = customerData;
      customerService.create.mockResolvedValue(mockCustomer);

      await customerController.create(req, res);

      expect(customerService.getByEmail).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should skip phone check if phone is empty string", async () => {
      const customerData = {
        name: "John Doe",
        phone: "   ",
      };
      const mockCustomer = { id: "1", ...customerData };

      req.body = customerData;
      customerService.create.mockResolvedValue(mockCustomer);

      await customerController.create(req, res);

      expect(customerService.getByPhone).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("getAll", () => {
    it("should fetch all customers with default filters", async () => {
      const mockCustomers = [
        { id: "1", name: "John Doe" },
        { id: "2", name: "Jane Doe" },
      ];

      customerService.getAll.mockResolvedValue(mockCustomers);

      await customerController.getAll(req, res);

      expect(customerService.getAll).toHaveBeenCalledWith({
        search: undefined,
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCustomers,
      });
    });

    it("should fetch customers with search and pagination", async () => {
      req.query = { search: "John", limit: "10", offset: "5" };
      const mockCustomers = [{ id: "1", name: "John Doe" }];

      customerService.getAll.mockResolvedValue(mockCustomers);

      await customerController.getAll(req, res);

      expect(customerService.getAll).toHaveBeenCalledWith({
        search: "John",
        limit: 10,
        offset: 5,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCustomers,
      });
    });
  });

  describe("getById", () => {
    it("should fetch customer by id", async () => {
      const mockCustomer = { id: "1", name: "John Doe" };
      req.params.id = "1";

      customerService.getById.mockResolvedValue(mockCustomer);

      await customerController.getById(req, res);

      expect(customerService.getById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCustomer,
      });
    });

    it("should return 404 if customer not found", async () => {
      req.params.id = "999";

      customerService.getById.mockResolvedValue(null);

      await customerController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Customer not found",
      });
    });
  });

  describe("update", () => {
    it("should update customer successfully", async () => {
      const updateData = { name: "John Updated" };
      const mockCustomer = { id: "1", ...updateData };

      req.params.id = "1";
      req.body = updateData;
      customerService.update.mockResolvedValue(mockCustomer);

      await customerController.update(req, res);

      expect(customerService.update).toHaveBeenCalledWith("1", updateData);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer updated successfully",
        data: mockCustomer,
      });
    });

    it("should return 404 if customer not found", async () => {
      req.params.id = "999";
      req.body = { name: "Updated" };

      customerService.update.mockResolvedValue(null);

      await customerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Khách hàng không tồn tại",
        },
      });
    });

    it("should return 409 if email already exists for another customer", async () => {
      const updateData = { email: "existing@example.com" };
      const existingCustomer = { id: "2", email: "existing@example.com" };

      req.params.id = "1";
      req.body = updateData;
      customerService.getByEmail.mockResolvedValue(existingCustomer);

      await customerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Khách hàng với email 'existing@example.com' đã tồn tại",
        },
      });
    });

    it("should return 409 if phone already exists for another customer", async () => {
      const updateData = { phone: "0123456789" };
      const existingCustomer = { id: "2", phone: "0123456789" };

      req.params.id = "1";
      req.body = updateData;
      customerService.getByPhone.mockResolvedValue(existingCustomer);

      await customerController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: {
          message: "Khách hàng với số điện thoại '0123456789' đã tồn tại",
        },
      });
    });

    it("should allow updating customer with their own email", async () => {
      const updateData = { email: "same@example.com" };
      const existingCustomer = { id: "1", email: "same@example.com" };
      const mockUpdated = { id: "1", ...updateData };

      req.params.id = "1";
      req.body = updateData;
      customerService.getByEmail.mockResolvedValue(existingCustomer);
      customerService.update.mockResolvedValue(mockUpdated);

      await customerController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer updated successfully",
        data: mockUpdated,
      });
    });

    it("should allow updating customer with their own phone", async () => {
      const updateData = { phone: "0123456789" };
      const existingCustomer = { id: "1", phone: "0123456789" };
      const mockUpdated = { id: "1", ...updateData };

      req.params.id = "1";
      req.body = updateData;
      customerService.getByPhone.mockResolvedValue(existingCustomer);
      customerService.update.mockResolvedValue(mockUpdated);

      await customerController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer updated successfully",
        data: mockUpdated,
      });
    });

    it("should skip email check if email is empty string", async () => {
      const updateData = { email: "   ", name: "Updated" };
      const mockUpdated = { id: "1", ...updateData };

      req.params.id = "1";
      req.body = updateData;
      customerService.update.mockResolvedValue(mockUpdated);

      await customerController.update(req, res);

      expect(customerService.getByEmail).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer updated successfully",
        data: mockUpdated,
      });
    });

    it("should skip phone check if phone is empty string", async () => {
      const updateData = { phone: "   ", name: "Updated" };
      const mockUpdated = { id: "1", ...updateData };

      req.params.id = "1";
      req.body = updateData;
      customerService.update.mockResolvedValue(mockUpdated);

      await customerController.update(req, res);

      expect(customerService.getByPhone).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer updated successfully",
        data: mockUpdated,
      });
    });
  });

  describe("delete", () => {
    it("should delete customer successfully", async () => {
      const mockCustomer = { id: "1", name: "John Doe" };
      req.params.id = "1";

      customerService.delete.mockResolvedValue(mockCustomer);

      await customerController.delete(req, res);

      expect(customerService.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Customer deleted successfully",
        data: mockCustomer,
      });
    });

    it("should return 404 if customer not found", async () => {
      req.params.id = "999";

      customerService.delete.mockResolvedValue(null);

      await customerController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Customer not found",
      });
    });
  });
});
