// Ensure module-alias is registered for path aliases
import "module-alias/register.js";

import { beforeEach, vi } from "vitest";

// Global mocks setup
vi.mock("@/db/index.js", () => ({
  db: {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => []),
          orderBy: vi.fn(() => []),
        })),
        leftJoin: vi.fn(() => ({
          where: vi.fn(() => ({
            groupBy: vi.fn(() => []),
          })),
        })),
        orderBy: vi.fn(() => []),
        limit: vi.fn(() => []),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => []),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => []),
      })),
    })),
    transaction: vi.fn((callback) => callback(this.db)),
    query: {
      inventory: {
        findMany: vi.fn(() => []),
        findFirst: vi.fn(() => null),
      },
      warehouseBins: {
        findMany: vi.fn(() => []),
        findFirst: vi.fn(() => null),
      },
      warehouseRacks: {
        findMany: vi.fn(() => []),
        findFirst: vi.fn(() => null),
      },
      warehouseZones: {
        findMany: vi.fn(() => []),
        findFirst: vi.fn(() => null),
      },
      suppliers: {
        findMany: vi.fn(() => []),
        findFirst: vi.fn(() => null),
      },
    },
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

vi.mock("@/utils/logger.js", () => ({
  default: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Global beforeEach to clear all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});
