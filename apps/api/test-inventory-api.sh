#!/bin/bash

# Inventory API E2E Test Script (Bash/curl version)
# This script tests all inventory endpoints using curl

BASE_URL="http://localhost:3000/api"
CONTENT_TYPE="application/json"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

echo -e "${CYAN}==========================================="
echo -e "  Inventory API E2E Tests"
echo -e "===========================================${NC}\n"

# Step 1: Login to get auth token
echo -e "\n${CYAN}=== STEP 1: Authentication ===${NC}"
echo -e "${YELLOW}-------------------------------------------${NC}"
echo -e "${GREEN}TEST: Login as admin${NC}"
echo -e "${GRAY}METHOD: POST | ENDPOINT: /auth/login${NC}"

# DO NOT UPDATE LOGIN CREDS - These are seeded credentials
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: $CONTENT_TYPE" \
  -d '{
    "email": "owner@pharmaflow.com",
    "password": "admin123"
  }')

echo -e "${GRAY}RESPONSE:${NC}"
echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"

# Debug: Check if jq is available
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Warning: jq not found, using grep/sed for token extraction${NC}"
    # Extract token using grep and sed as fallback
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
else
    # Try to extract token from nested structure first, then flat structure
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token // .token' 2>/dev/null)
fi

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo -e "\n${RED}ERROR: Failed to login or extract token.${NC}"
    echo -e "${YELLOW}Raw response length: ${#LOGIN_RESPONSE} characters${NC}"
    echo -e "${YELLOW}Please ensure:${NC}"
    echo -e "${YELLOW}  1. API server is running (npm run dev)${NC}"
    echo -e "${YELLOW}  2. Database is seeded with owner user${NC}"
    echo -e "${YELLOW}  3. Credentials are correct (owner@pharmaflow.com / admin123)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo -e "${GRAY}Token: ${TOKEN:0:20}...${NC}\n"

# Function to make API requests
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local body=$4
    
    echo -e "${YELLOW}-------------------------------------------${NC}"
    echo -e "${GREEN}TEST: $description${NC}"
    echo -e "${GRAY}METHOD: $method | ENDPOINT: $endpoint${NC}"
    
    if [ -n "$body" ]; then
        echo -e "${GRAY}REQUEST BODY:${NC}"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
          -H "Content-Type: $CONTENT_TYPE" \
          -H "Authorization: Bearer $TOKEN" \
          -d "$body")
    else
        response=$(curl -s -X "$method" "$BASE_URL$endpoint" \
          -H "Content-Type: $CONTENT_TYPE" \
          -H "Authorization: Bearer $TOKEN")
    fi
    
    echo -e "${GRAY}RESPONSE:${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
    echo ""
}

echo -e "\n${CYAN}=== STEP 2: Inventory API Tests ===${NC}\n"

# Test 1: Get all inventory
test_endpoint "GET" "/inventory" "Get all inventory items"

# Test 2: Get all inventory with pagination
test_endpoint "GET" "/inventory?page=1&limit=10" "Get inventory with pagination"

# Test 3: Get inventory filtered by medication variant
test_endpoint "GET" "/inventory?medicationVariantId=1" "Get inventory filtered by medication variant"

# Test 4: Get inventory filtered by bin
test_endpoint "GET" "/inventory?binId=1" "Get inventory filtered by bin ID"

# Test 5: Get inventory filtered by batch number
test_endpoint "GET" "/inventory?batchNumber=BATCH001" "Get inventory filtered by batch number"

# Test 6: Get inventory summary by variant
test_endpoint "GET" "/inventory/summary/by-variant" "Get inventory summary grouped by variant"

# Test 7: Get inventory summary by variant with pagination
test_endpoint "GET" "/inventory/summary/by-variant?page=1&limit=5" "Get inventory summary with pagination"

# Test 8: Get expiring inventory
test_endpoint "GET" "/inventory/expiring" "Get expiring inventory (default 30 days)"

# Test 9: Get expiring inventory with custom days
test_endpoint "GET" "/inventory/expiring?daysUntilExpiry=60" "Get inventory expiring in 60 days"

# Test 10: Get low stock inventory
test_endpoint "GET" "/inventory/low-stock" "Get low stock inventory"

# Test 11: Get low stock with custom threshold
test_endpoint "GET" "/inventory/low-stock?threshold=50" "Get inventory below 50 units"

# Test 12: Get specific inventory by ID
echo -e "${CYAN}ℹ Attempting to get inventory item by ID...${NC}"
FIRST_INVENTORY=$(curl -s -X GET "$BASE_URL/inventory?limit=1" \
  -H "Content-Type: $CONTENT_TYPE" \
  -H "Authorization: Bearer $TOKEN")

INVENTORY_ID=$(echo "$FIRST_INVENTORY" | jq -r '.data[0].id' 2>/dev/null)

if [ -n "$INVENTORY_ID" ] && [ "$INVENTORY_ID" != "null" ]; then
    test_endpoint "GET" "/inventory/$INVENTORY_ID" "Get inventory by ID: $INVENTORY_ID"
    
    # Test 13: Update inventory (Owner only)
    echo -e "${CYAN}ℹ Testing owner-only operations...${NC}\n"
    FUTURE_DATE=$(date -d "+6 months" +%Y-%m-%d 2>/dev/null || date -v +6m +%Y-%m-%d 2>/dev/null)
    test_endpoint "PATCH" "/inventory/$INVENTORY_ID" "Update inventory expiration date" \
      "{\"expirationDate\": \"$FUTURE_DATE\"}"
    
    # Test 14: Adjust inventory quantity (Owner only)
    test_endpoint "PATCH" "/inventory/$INVENTORY_ID/adjust" "Adjust inventory quantity" \
      '{"quantityChange": -5, "reason": "Damaged items removed - E2E Test"}'
else
    echo -e "${YELLOW}⚠ Warning: No inventory items found. Skipping ID-based tests.${NC}\n"
fi

# Test 15: Move inventory between bins (Owner only)
echo -e "${CYAN}ℹ Testing inventory move operation...${NC}\n"
test_endpoint "POST" "/inventory/move" "Move inventory between bins" \
  '{"inventoryId": 1, "fromBinId": 1, "toBinId": 2, "quantity": 10, "reason": "Reorganization - E2E Test"}'

# Test 16: Invalid requests (Error handling)
echo -e "\n${CYAN}=== STEP 3: Error Handling Tests ===${NC}\n"

# Test invalid ID
test_endpoint "GET" "/inventory/99999" "Get inventory with invalid ID (should return 404)"

# Test without authentication
echo -e "${YELLOW}-------------------------------------------${NC}"
echo -e "${GREEN}TEST: Get inventory without auth token (should return 401)${NC}"
echo -e "${GRAY}METHOD: GET | ENDPOINT: /inventory${NC}"
NO_AUTH_RESPONSE=$(curl -s -X GET "$BASE_URL/inventory" -H "Content-Type: $CONTENT_TYPE")
echo -e "${GRAY}RESPONSE:${NC}"
echo "$NO_AUTH_RESPONSE" | jq '.' 2>/dev/null || echo "$NO_AUTH_RESPONSE"
echo ""

# Test invalid pagination
test_endpoint "GET" "/inventory?page=0&limit=-1" "Get inventory with invalid pagination"

# Test invalid adjust body
test_endpoint "PATCH" "/inventory/1/adjust" "Adjust inventory with invalid data (should return 400)" \
  '{"quantityChange": "invalid"}'

echo -e "\n${CYAN}==========================================="
echo -e "  Test Execution Complete!"
echo -e "===========================================${NC}\n"
echo -e "${YELLOW}Summary:${NC}"
echo -e "  - Check results above for any failures"
echo -e "  - Green ✓ indicates successful requests"
echo -e "  - Red ✗ indicates failed requests\n"
