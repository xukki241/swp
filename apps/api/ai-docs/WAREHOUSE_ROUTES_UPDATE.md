# Warehouse Routes Update

## Summary

Updated the warehouse API endpoints to follow the Postman collection specification with nested routes.

## Changes Made

### 1. Created New Route File: `warehouseRoutes.js`

- Created a new consolidated warehouse route file that follows the nested structure from the Postman collection
- This file provides the `/api/warehouse/*` endpoints

### 2. Updated Route Structure

#### Old Structure (Flat Routes):

```
/api/warehouse-zones
/api/warehouse-racks
/api/warehouse-bins
```

#### New Structure (Nested Routes - Following Postman Spec):

```
/api/warehouse/zones
/api/warehouse/zones/:zoneId/racks
/api/warehouse/racks/:rackId/bins
/api/warehouse/bins/:id
/api/warehouse/bins/:id/inventory
```

### 3. Route Mappings

#### Zones

- `GET /api/warehouse/zones` - Get all zones
- `POST /api/warehouse/zones` - Create zone(s)
- `GET /api/warehouse/zones/:id` - Get zone by ID
- `PATCH /api/warehouse/zones/:id` - Update zone
- `DELETE /api/warehouse/zones/:id` - Delete zone

#### Racks (Nested under Zones)

- `POST /api/warehouse/zones/:zoneId/racks` - Create rack(s) in a zone
- `GET /api/warehouse/zones/:zoneId/racks` - Get all racks in a zone
- `GET /api/warehouse/racks/:id` - Get rack by ID
- `PATCH /api/warehouse/racks/:id` - Update rack
- `DELETE /api/warehouse/racks/:id` - Delete rack

#### Bins (Nested under Racks)

- `POST /api/warehouse/racks/:rackId/bins` - Create bin(s) in a rack
- `GET /api/warehouse/racks/:rackId/bins` - Get all bins in a rack
- `GET /api/warehouse/bins/:id` - Get bin by ID
- `GET /api/warehouse/bins/:id/inventory` - Get inventory in a bin
- `PATCH /api/warehouse/bins/:id` - Update bin
- `DELETE /api/warehouse/bins/:id` - Delete bin

### 4. Parameter Injection

Added middleware to inject parent IDs from route params into request body:

- When creating racks via `/api/warehouse/zones/:zoneId/racks`, the `zoneId` from params is injected into `req.body.zoneId`
- When creating bins via `/api/warehouse/racks/:rackId/bins`, the `rackId` from params is injected into `req.body.rackId`

This ensures controllers receive the parent ID without modification.

### 5. Backward Compatibility

The old flat routes are still available:

- `/api/warehouse-zones` (old)
- `/api/warehouse-racks` (old)
- `/api/warehouse-bins` (old)

Both old and new routes work simultaneously for backward compatibility during migration.

## Files Modified

1. **Created**: `src/routes/warehouseRoutes.js` - New consolidated warehouse routes
2. **Updated**: `src/routes/index.js` - Added export for warehouseRoutes
3. **Updated**: `src/app.js` - Added warehouse routes to the app

## Migration Guide

### For API Consumers

Update your API calls from:

```javascript
// Old
POST /api/warehouse-zones
POST /api/warehouse-racks
POST /api/warehouse-bins

// New (Postman spec compliant)
POST /api/warehouse/zones
POST /api/warehouse/zones/:zoneId/racks
POST /api/warehouse/racks/:rackId/bins
```

### Example Usage

#### Creating a Zone, Rack, and Bin (New Way)

```javascript
// 1. Create a zone
POST /api/warehouse/zones
Body: { "code": "Z001", "name": "Zone A", "description": "Main zone" }
Response: { "success": true, "data": { "id": 1, ... } }

// 2. Create a rack in that zone
POST /api/warehouse/zones/1/racks
Body: { "code": "R001", "name": "Rack A" }
Response: { "success": true, "data": { "id": 1, "zoneId": 1, ... } }

// 3. Create a bin in that rack
POST /api/warehouse/racks/1/bins
Body: { "code": "B001", "name": "Bin A", "level": 1, "number": 1 }
Response: { "success": true, "data": { "id": 1, "rackId": 1, ... } }

// 4. Get inventory in that bin
GET /api/warehouse/bins/1/inventory
Response: { "success": true, "data": [...] }
```

## Testing

The server starts successfully with the new routes. All endpoints are ready for testing with Postman.

## Notes

- All routes require authentication
- Create, Update, and Delete operations require "owner" role
- Get operations are accessible by both "owner" and "staff" roles
- The nested structure better represents the hierarchical relationship: Zone → Rack → Bin
