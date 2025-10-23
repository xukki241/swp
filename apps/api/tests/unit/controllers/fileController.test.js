import { beforeEach, describe, expect, it, vi } from "vitest";

import { fileController } from "@/controllers/fileController.js";
import { fileService } from "@/services/fileService.js";

vi.mock("@/services/fileService.js");
vi.mock("@/utils/logger.js");

describe("FileController", () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      user: { id: "user-uuid-123" },
      params: {},
      query: {},
      file: null,
      files: null,
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      setHeader: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("upload", () => {
    it("should upload a file successfully", async () => {
      const mockFile = {
        originalname: "test.pdf",
        mimetype: "application/pdf",
        size: 12345,
        buffer: Buffer.from("test content"),
      };

      const mockCreatedFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      mockReq.file = mockFile;
      fileService.create.mockResolvedValue(mockCreatedFile);

      await fileController.upload(mockReq, mockRes, mockNext);

      expect(fileService.create).toHaveBeenCalledWith({
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        blob: mockFile.buffer,
        uploadedBy: "user-uuid-123",
      });
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "File uploaded successfully",
        data: mockCreatedFile,
      });
    });

    it("should return 400 if no file is provided", async () => {
      mockReq.file = null;

      await fileController.upload(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "No file uploaded. Please provide a file.",
      });
    });

    it("should handle file with no extension", async () => {
      const mockFile = {
        originalname: "testfile",
        mimetype: "text/plain",
        size: 100,
        buffer: Buffer.from("test"),
      };

      const mockCreatedFile = {
        id: "file-uuid-456",
        filename: "testfile",
        fileType: "unknown",
        mimeType: "text/plain",
        fileSize: 100,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date(),
      };

      mockReq.file = mockFile;
      fileService.create.mockResolvedValue(mockCreatedFile);

      await fileController.upload(mockReq, mockRes, mockNext);

      expect(fileService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          fileType: "unknown",
        })
      );
    });
  });

  describe("uploadMultiple", () => {
    it("should upload multiple files successfully", async () => {
      const mockFiles = [
        {
          originalname: "test1.pdf",
          mimetype: "application/pdf",
          size: 12345,
          buffer: Buffer.from("test1"),
        },
        {
          originalname: "test2.jpg",
          mimetype: "image/jpeg",
          size: 54321,
          buffer: Buffer.from("test2"),
        },
      ];

      const mockCreatedFiles = [
        {
          id: "file-uuid-1",
          filename: "test1.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 12345,
        },
        {
          id: "file-uuid-2",
          filename: "test2.jpg",
          fileType: "jpg",
          mimeType: "image/jpeg",
          fileSize: 54321,
        },
      ];

      mockReq.files = mockFiles;
      fileService.create
        .mockResolvedValueOnce(mockCreatedFiles[0])
        .mockResolvedValueOnce(mockCreatedFiles[1]);

      await fileController.uploadMultiple(mockReq, mockRes, mockNext);

      expect(fileService.create).toHaveBeenCalledTimes(2);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "2 file(s) uploaded successfully",
        data: mockCreatedFiles,
      });
    });

    it("should return 400 if no files are provided", async () => {
      mockReq.files = [];

      await fileController.uploadMultiple(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "No files uploaded. Please provide files.",
      });
    });
  });

  describe("getById", () => {
    it("should return file metadata", async () => {
      const mockFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date("2024-01-01T00:00:00.000Z"),
      };

      mockReq.params.id = "file-uuid-123";
      fileService.getById.mockResolvedValue(mockFile);

      await fileController.getById(mockReq, mockRes, mockNext);

      expect(fileService.getById).toHaveBeenCalledWith("file-uuid-123");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFile,
      });
    });

    it("should return 404 if file not found", async () => {
      mockReq.params.id = "non-existent-uuid";
      fileService.getById.mockResolvedValue(null);

      await fileController.getById(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "File not found",
      });
    });
  });

  describe("download", () => {
    it("should download file with proper headers", async () => {
      const mockFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
        blob: Buffer.from("test content"),
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date(),
      };

      mockReq.params.id = "file-uuid-123";
      fileService.getFileWithBlob.mockResolvedValue(mockFile);

      await fileController.download(mockReq, mockRes, mockNext);

      expect(fileService.getFileWithBlob).toHaveBeenCalledWith("file-uuid-123");
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "application/pdf"
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'attachment; filename="test.pdf"'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith("Content-Length", 12345);
      expect(mockRes.send).toHaveBeenCalledWith(mockFile.blob);
    });

    it("should return 404 if file not found", async () => {
      mockReq.params.id = "non-existent-uuid";
      fileService.getFileWithBlob.mockResolvedValue(null);

      await fileController.download(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "File not found",
      });
    });
  });

  describe("view", () => {
    it("should view file inline with proper headers", async () => {
      const mockFile = {
        id: "file-uuid-123",
        filename: "image.jpg",
        fileType: "jpg",
        mimeType: "image/jpeg",
        fileSize: 54321,
        blob: Buffer.from("image content"),
        uploadedBy: "user-uuid-123",
        uploadedAt: new Date(),
      };

      mockReq.params.id = "file-uuid-123";
      fileService.getFileWithBlob.mockResolvedValue(mockFile);

      await fileController.view(mockReq, mockRes, mockNext);

      expect(fileService.getFileWithBlob).toHaveBeenCalledWith("file-uuid-123");
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Type",
        "image/jpeg"
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        "Content-Disposition",
        'inline; filename="image.jpg"'
      );
      expect(mockRes.send).toHaveBeenCalledWith(mockFile.blob);
    });
  });

  describe("getAll", () => {
    it("should return paginated files", async () => {
      const mockFiles = [
        {
          id: "file-uuid-1",
          filename: "test1.pdf",
          fileType: "pdf",
          mimeType: "application/pdf",
          fileSize: 12345,
        },
        {
          id: "file-uuid-2",
          filename: "test2.jpg",
          fileType: "jpg",
          mimeType: "image/jpeg",
          fileSize: 54321,
        },
      ];

      mockReq.query = { page: "1", limit: "50" };
      fileService.getAll.mockResolvedValue({
        data: mockFiles,
        total: 2,
      });

      await fileController.getAll(mockReq, mockRes, mockNext);

      expect(fileService.getAll).toHaveBeenCalledWith({
        fileType: undefined,
        uploadedBy: undefined,
        limit: 50,
        offset: 0,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockFiles,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should filter by fileType and uploadedBy", async () => {
      mockReq.query = {
        page: "1",
        limit: "10",
        fileType: "pdf",
        uploadedBy: "user-uuid-123",
      };
      fileService.getAll.mockResolvedValue({ data: [], total: 0 });

      await fileController.getAll(mockReq, mockRes, mockNext);

      expect(fileService.getAll).toHaveBeenCalledWith({
        fileType: "pdf",
        uploadedBy: "user-uuid-123",
        limit: 10,
        offset: 0,
      });
    });
  });

  describe("delete", () => {
    it("should delete file successfully", async () => {
      const mockDeletedFile = {
        id: "file-uuid-123",
        filename: "test.pdf",
        fileType: "pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
      };

      mockReq.params.id = "file-uuid-123";
      fileService.delete.mockResolvedValue(mockDeletedFile);

      await fileController.delete(mockReq, mockRes, mockNext);

      expect(fileService.delete).toHaveBeenCalledWith("file-uuid-123");
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: "File deleted successfully",
        data: mockDeletedFile,
      });
    });

    it("should return 404 if file not found", async () => {
      mockReq.params.id = "non-existent-uuid";
      fileService.delete.mockResolvedValue(null);

      await fileController.delete(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        message: "File not found",
      });
    });
  });
});
