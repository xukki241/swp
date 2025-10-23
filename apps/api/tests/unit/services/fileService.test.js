import { beforeEach, describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { fileService } from "@/services/fileService.js";

describe("FileService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a file and return metadata without blob", async () => {
      const mockFileData = {
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        blob: Buffer.from("test content"),
        uploadedBy: "user-uuid-123",
      };

      const mockCreatedFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        blob: Buffer.from("test content"),
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockCreatedFile]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert.mockReturnValue({ values: mockValues });

      const result = await fileService.create(mockFileData);

      expect(db.insert).toHaveBeenCalled();
      expect(mockValues).toHaveBeenCalled();
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual({
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      expect(result.blob).toBeUndefined();
    });

    it("should create a file with null uploadedBy", async () => {
      const mockFileData = {
        filename: "test.jpg",
        fileType: "jpg",
        mimeType: "image/jpeg",
        fileSize: 54321,
        blob: Buffer.from("image content"),
        uploadedBy: null,
      };

      const mockCreatedFile = {
        id: "file-uuid-456",
        ...mockFileData,
        uploadedAt: new Date(),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockCreatedFile]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert.mockReturnValue({ values: mockValues });

      const result = await fileService.create(mockFileData);

      expect(result.uploadedBy).toBeNull();
    });
  });

  describe("getById", () => {
    it("should return file metadata without blob", async () => {
      const mockFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockFile]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.getById("file-uuid-123");

      expect(db.select).toHaveBeenCalled();
      expect(result).toEqual(mockFile);
    });

    it("should return null if file not found", async () => {
      const mockWhere = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.getById("non-existent-uuid");

      expect(result).toBeNull();
    });
  });

  describe("getFileWithBlob", () => {
    it("should return complete file with blob", async () => {
      const mockFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        blob: Buffer.from("test content"),
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockWhere = vi.fn().mockResolvedValue([mockFile]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.getFileWithBlob("file-uuid-123");

      expect(result).toEqual(mockFile);
      expect(result.blob).toBeDefined();
    });

    it("should return null if file not found", async () => {
      const mockWhere = vi.fn().mockResolvedValue([]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.getFileWithBlob("non-existent-uuid");

      expect(result).toBeNull();
    });
  });

  describe("getAll", () => {
    it("should return paginated files without blobs", async () => {
      const mockFiles = [
        {
          id: "file-uuid-1",
          filename: "test1.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 12345,
          uploadedBy: "user-uuid-123",
          uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
        },
        {
          id: "file-uuid-2",
          filename: "test2.jpg",
          fileType: "jpg",
          mimeType: "image/jpeg",
          fileSize: 54321,
          uploadedBy: "user-uuid-456",
          uploadedAt: new Date("2024-01-02T00:00:00.000Z"),
        },
      ];

      // Mock count query
      const mockCountWhere = vi.fn().mockResolvedValue([{ count: "2" }]);
      const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere });

      // Mock data query
      const mockOffset = vi.fn().mockResolvedValue(mockFiles);
      const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockDataWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockDataFrom = vi.fn().mockReturnValue({ where: mockDataWhere });

      db.select
        .mockReturnValueOnce({ from: mockCountFrom })
        .mockReturnValueOnce({ from: mockDataFrom });

      const result = await fileService.getAll({
        limit: 50,
        offset: 0,
      });

      expect(result).toEqual({
        data: mockFiles,
        total: 2,
      });
    });

    it("should filter by fileType", async () => {
      const mockFiles = [
        {
          id: "file-uuid-1",
          filename: "test1.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 12345,
          uploadedBy: "user-uuid-123",
          uploadedAt: new Date(),
        },
      ];

      const mockCountWhere = vi.fn().mockResolvedValue([{ count: "1" }]);
      const mockCountFrom = vi.fn().mockReturnValue({ where: mockCountWhere });

      const mockOffset = vi.fn().mockResolvedValue(mockFiles);
      const mockLimit = vi.fn().mockReturnValue({ offset: mockOffset });
      const mockOrderBy = vi.fn().mockReturnValue({ limit: mockLimit });
      const mockDataWhere = vi.fn().mockReturnValue({ orderBy: mockOrderBy });
      const mockDataFrom = vi.fn().mockReturnValue({ where: mockDataWhere });

      db.select
        .mockReturnValueOnce({ from: mockCountFrom })
        .mockReturnValueOnce({ from: mockDataFrom });

      const result = await fileService.getAll({
        fileType: "pdf",
        limit: 50,
        offset: 0,
      });

      expect(result.data).toEqual(mockFiles);
      expect(result.total).toBe(1);
    });
  });

  describe("delete", () => {
    it("should delete a file and return metadata", async () => {
      const mockDeletedFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockReturning = vi.fn().mockResolvedValue([mockDeletedFile]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete.mockReturnValue({ where: mockWhere });

      const result = await fileService.delete("file-uuid-123");

      expect(db.delete).toHaveBeenCalled();
      expect(result).toEqual(mockDeletedFile);
    });

    it("should return null if file not found", async () => {
      const mockReturning = vi.fn().mockResolvedValue([]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete.mockReturnValue({ where: mockWhere });

      const result = await fileService.delete("non-existent-uuid");

      expect(result).toBeNull();
    });
  });

  describe("exists", () => {
    it("should return true if file exists", async () => {
      const mockWhere = vi.fn().mockResolvedValue([{ count: "1" }]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.exists("file-uuid-123");

      expect(result).toBe(true);
    });

    it("should return false if file does not exist", async () => {
      const mockWhere = vi.fn().mockResolvedValue([{ count: "0" }]);
      const mockFrom = vi.fn().mockReturnValue({ where: mockWhere });
      db.select.mockReturnValue({ from: mockFrom });

      const result = await fileService.exists("non-existent-uuid");

      expect(result).toBe(false);
    });
  });
});
