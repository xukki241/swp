# Warehouse Module Documentation

## Overview

The warehouse module provides a comprehensive hierarchical structure for managing physical storage locations within a pharmacy warehouse. The hierarchy follows a three-tier structure:

**Zones → Racks → Bins**

This module supports both individual and batch creation operations to facilitate efficient warehouse setup.

## Warehouse Structure

### Zones (Top Level)

Warehouse zones represent major physical areas with specific storage characteristics.

**Properties:**

- `id` - UUID identifier
- `code` - Unique code (e.g., "ZONE-001")
- `name` - Display name (e.g., "Zone 1")
- `type` - Zone type enum: `normal`, `cold`, `hazard`, `quarantine`
- `location` - Optional physical location description (e.g., "Building A, Floor 2")
- `description` - Optional notes

**Zone Types:**

- `normal` - Standard temperature storage
- `cold` - Refrigerated storage for temperature-sensitive medications
- `hazard` - Storage for hazardous materials
- `quarantine` - Isolation area for quality control or recalled items

### Racks (Mid Level)

Racks are physical shelving units within a zone.

**Properties:**

- `id` - UUID identifier
- `zoneId` - Parent zone reference
- `code` - Code unique within the zone
- `name` - Display name
- `description` - Optional notes

**Uniqueness:** Each rack's `code` must be unique within its zone (composite constraint: `zoneId` + `code`)

### Bins (Bottom Level)

Bins are individual storage compartments within a rack, positioned by level and number.

**Properties:**

- `id` - UUID identifier
- `rackId` - Parent rack reference
- `code` - Code unique within the rack
- `name` - Display name
- `level` - Vertical level number (integer ≥ 1)
- `number` - Bin position number on the level (integer ≥ 1)
- `description` - Optional notes

**Uniqueness Constraints:**

- `code` must be unique within the rack
- `level` + `number` combination must be unique within the rack

**Positioning:** Bins use a 2D grid system:

- `level` - Vertical position (e.g., 1 = bottom shelf, 5 = top shelf)
- `number` - Horizontal position (e.g., 1 = leftmost, 10 = rightmost)

## API Endpoints (19 Total)

### Zone Operations (5 endpoints)

#### 1. List Zones

```
GET /warehouse/zones
```

**Query Parameters:** page, limit, sortBy, sortOrder, search
**Response:** Paginated list of zones

#### 2. Create Zones

```
POST /warehouse/zones
```

**Request Body:** Array of zone objects
**Response:** Array of created zones

#### 3. Batch Create Zones

```
POST /warehouse/zones/batch
```

**Request Body:**

```json
{
  "quantity": 10,
  "codePrefix": "ZONE",
  "namePrefix": "Zone"
}
```

**Response:** Array of created zones (e.g., ZONE-001 to ZONE-010)

#### 4. Get Zone

```
GET /warehouse/zones/{zoneId}
```

#### 5. Update Zone

```
PATCH /warehouse/zones/{zoneId}
```

#### 6. Delete Zone

```
DELETE /warehouse/zones/{zoneId}
```

### Rack Operations (6 endpoints)

#### 7. List Racks in Zone

```
GET /warehouse/zones/{zoneId}/racks
```

**Query Parameters:** page, limit, sortBy, sortOrder, search
**Response:** Paginated list of racks in the zone

#### 8. Create Racks in Zone

```
POST /warehouse/zones/{zoneId}/racks
```

**Request Body:** Array of rack objects
**Response:** Array of created racks (automatically linked to the zone)

#### 9. Batch Create Racks in Zone

```
POST /warehouse/zones/{zoneId}/racks/batch
```

**Request Body:**

```json
{
  "quantity": 5,
  "codePrefix": "RACK",
  "namePrefix": "Rack"
}
```

**Response:** Array of created racks (e.g., RACK-001 to RACK-005)

#### 10. Get Rack

```
GET /warehouse/racks/{rackId}
```

**Note:** Flat access (not nested under zone)

#### 11. Update Rack

```
PATCH /warehouse/racks/{rackId}
```

#### 12. Delete Rack

```
DELETE /warehouse/racks/{rackId}
```

### Bin Operations (8 endpoints)

#### 13. List Bins in Rack

```
GET /warehouse/racks/{rackId}/bins
```

**Query Parameters:** page, limit, sortBy, sortOrder, search
**Response:** Paginated list of bins in the rack

#### 14. Create Bins in Rack

```
POST /warehouse/racks/{rackId}/bins
```

**Request Body:** Array of bin objects
**Response:** Array of created bins (automatically linked to the rack)

#### 15. Batch Create Bins in Rack - Grid Mode

```
POST /warehouse/racks/{rackId}/bins/batch
```

**Request Body (Grid Mode):**

```json
{
  "mode": "grid",
  "levels": 5,
  "binsPerLevel": 10,
  "codePrefix": "BIN",
  "namePrefix": "Bin"
}
```

**Response:** Creates 50 bins (5 levels × 10 bins) with codes BIN-001 to BIN-050
**Positioning:** Bins are numbered sequentially, level 1 gets bins 1-10, level 2 gets bins 11-20, etc.

#### 16. Batch Create Bins in Rack - List Mode

```
POST /warehouse/racks/{rackId}/bins/batch
```

**Request Body (List Mode):**

```json
{
  "mode": "list",
  "binsPerLevelList": [10, 8, 6, 4, 2],
  "codePrefix": "BIN",
  "namePrefix": "Bin"
}
```

**Response:** Creates 30 bins (10+8+6+4+2) with custom bins per level
**Use Case:** Variable bin counts per level (e.g., tapered shelving)

#### 17. Get Bin

```
GET /warehouse/bins/{binId}
```

**Note:** Flat access (not nested under rack)

#### 18. Update Bin

```
PATCH /warehouse/bins/{binId}
```

#### 19. Delete Bin

```
DELETE /warehouse/bins/{binId}
```

## Access Patterns

### Nested Access

Used for operations within a specific parent context:

- `/warehouse/zones/{zoneId}/racks` - List/create racks within a zone
- `/warehouse/racks/{rackId}/bins` - List/create bins within a rack

### Flat Access

Used for direct operations on a specific resource:

- `/warehouse/racks/{rackId}` - Get/update/delete a specific rack
- `/warehouse/bins/{binId}` - Get/update/delete a specific bin

This dual pattern allows both hierarchical management and direct access to specific resources.

## Batch Creation Features

### Auto-Generated Codes and Names

All batch creation endpoints generate sequential codes and names:

- **Codes:** `{prefix}-{sequential_number}` (e.g., ZONE-001, RACK-005, BIN-042)
- **Names:** `{prefix} {sequential_number}` (e.g., "Zone 1", "Rack 5", "Bin 42")

### Grid vs List Mode for Bins

**Grid Mode:**

- Creates a uniform grid structure
- Requires: `levels` and `binsPerLevel`
- Example: 5 levels × 10 bins = 50 total bins

**List Mode:**

- Creates custom bins per level
- Requires: `binsPerLevelList` (array of integers)
- Example: [10, 8, 6, 4, 2] = 30 total bins with varying counts per level

## Naming Convention

### API (camelCase)

All request/response payloads use camelCase:

- `zoneId`, `rackId`, `binId`
- `codePrefix`, `namePrefix`
- `binsPerLevel`, `binsPerLevelList`

### Database (snake_case)

Database tables and columns use snake_case:

- `zone_id`, `rack_id`, `bin_id`
- `code_prefix`, `name_prefix`
- `bins_per_level`, `bins_per_level_list`

## Component Schema Files

### Zone Schemas

**File:** `components/warehouse/zone-schemas.yaml`
**Schemas:**

- `WarehouseZone` - Base zone object
- `CreateWarehouseZone` - Single zone creation
- `CreateWarehouseZonesRequest` - Array of zones to create
- `CreateWarehouseZonesResponse` - Array of created zones
- `BatchCreateWarehouseZones` - Batch creation with quantity/prefixes
- `UpdateWarehouseZone` - Zone update payload
- `WarehouseZoneListResponse` - Paginated zone list

### Rack Schemas

**File:** `components/warehouse/rack-schemas.yaml`
**Schemas:**

- `WarehouseRack` - Base rack object
- `CreateWarehouseRack` - Single rack creation
- `CreateWarehouseRacksRequest` - Array of racks to create
- `CreateWarehouseRacksResponse` - Array of created racks
- `BatchCreateWarehouseRacks` - Batch creation with quantity/prefixes
- `UpdateWarehouseRack` - Rack update payload
- `WarehouseRackListResponse` - Paginated rack list

### Bin Schemas

**File:** `components/warehouse/bin-schemas.yaml`
**Schemas:**

- `WarehouseBin` - Base bin object
- `CreateWarehouseBin` - Single bin creation
- `CreateWarehouseBinsRequest` - Array of bins to create
- `CreateWarehouseBinsResponse` - Array of created bins
- `BatchCreateWarehouseBinsGrid` - Grid mode batch creation
- `BatchCreateWarehouseBinsList` - List mode batch creation
- `BatchCreateWarehouseBins` - Union of grid/list modes with discriminator
- `UpdateWarehouseBin` - Bin update payload
- `WarehouseBinListResponse` - Paginated bin list

## Path Parameters

Added to `components/common/parameters.yaml`:

- `ZoneIdParam` - UUID for zone identification
- `RackIdParam` - UUID for rack identification
- `BinIdParam` - UUID for bin identification

## Use Cases

### Initial Warehouse Setup

1. Create zones for different storage types (normal, cold, hazard)
2. Batch create racks within each zone
3. Batch create bins within each rack using grid or list mode

### Expansion

- Add individual zones, racks, or bins as needed
- Use batch creation for uniform expansions

### Organization

- Query nested endpoints to view hierarchy
- Use flat endpoints to access specific resources directly

### Integration with Inventory

- Bins serve as storage locations for inventory items
- `binId` is referenced when creating purchase receipts
- Bins track which medications are stored where

## Summary

**Total Endpoints:** 19

- Zones: 6 endpoints (list, create, batch, get, update, delete)
- Racks: 6 endpoints (nested list/create/batch, flat get/update/delete)
- Bins: 7 endpoints (nested list/create/batch with modes, flat get/update/delete)

**Key Features:**

- Hierarchical 3-tier structure
- Batch creation with auto-generated codes
- Flexible bin creation (grid or list mode)
- Dual access patterns (nested and flat)
- Zone types for specialized storage
- Bin positioning with level and number

**camelCase Convention:** All API payloads use camelCase (codePrefix, binsPerLevel, etc.)
