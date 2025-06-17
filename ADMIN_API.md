# SQUL Admin Dashboard API Documentation

This document provides comprehensive API documentation for building admin dashboard that manage the SQUL system. This API enables administrative operations including user authentication, store management, API key management, provider credential configuration, and system monitoring.

## Base URL

```
https://api.brui.cc/admin
```

## Authentication

All admin endpoints (except `/login`, `/check-auth`, and `/system/health`) require authentication using session-based authentication.

### Authentication Flow

1. **Login** using `/login` with username and password
2. **Session cookie** is automatically set for subsequent requests
3. **Check authentication status** using `/check-auth`
4. **Logout** using `/logout` to end the session

---

## Authentication Endpoints

### POST /admin/login

Authenticate an admin user and create a session.

**Request Body:**
```json
{
  "username": "admin",
  "password": "password"
}
```

**Response (200 - Success):**
```json
{
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "admin"
  }
}
```

**Response (200 - Already Logged In):**
```json
{
  "message": "Already logged in",
  "data": {
    "id": 1
  }
}
```

**Response (400 - Missing Fields):**
```json
{
  "message": "Username and password are required"
}
```

**Response (401 - Invalid Credentials):**
```json
{
  "message": "Invalid username or password"
}
```

---

### POST /admin/logout

Log out the current admin user and destroy the session.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

### GET /admin/check-auth

Check if the current user is authenticated and return user information.

**Response (200 - Authenticated):**
```json
{
  "message": "User is authenticated",
  "data": {
    "authenticated": true,
    "id": 1
  }
}
```

**Response (200 - Not Authenticated):**
```json
{
  "message": "User is not authenticated",
  "data": {
    "authenticated": false
  }
}
```

---

### POST /admin/change-password

Change the password for the currently authenticated admin user.

**Authentication:** Required

**Request Body:**
```json
{
  "password": "new-password"
}
```

**Response (200 - Success):**
```json
{
  "message": "Password updated successfully"
}
```

**Response (400 - Missing Password):**
```json
{
  "message": "Password is required"
}
```

**Response (400 - Password Too Short):**
```json
{
  "message": "Password must be at least 8 characters long"
}
```

---

## Store Management Endpoints

Stores represent client accounts that can access the game provider APIs. Each store can have API keys and provider credentials configured.

### GET /admin/get-stores

Retrieve all stores with optional search filtering.

**Authentication:** Required

**Query Parameters:**
- `search` (optional): Search term to filter stores by name

**Example Request:**
```
GET /admin/get-stores?search=store1
```

**Response (200):**
```json
{
  "message": "Stores retrieved successfully",
  "data": {
    "stores": [
      {
        "id": 1,
        "name": "store1",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "name": "store2", 
        "created_at": "2024-01-16T14:20:00Z"
      }
    ],
    "count": 2
  }
}
```

---

### GET /admin/get-store

Retrieve a specific store by ID.

**Authentication:** Required

**Query Parameters:**
- `store_id` (required): Store ID

**Example Request:**
```
GET /admin/get-store?store_id=1
```

**Response (200 - Success):**
```json
{
  "message": "Store retrieved successfully",
  "data": {
    "id": 1,
    "name": "gamestore1",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Missing Store ID):**
```json
{
  "message": "Store ID is required as a query parameter"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

---

### POST /admin/create-store

Create a new store.

**Authentication:** Required

**Request Body:**
```json
{
  "name": "newstore"
}
```

**Response (201 - Created):**
```json
{
  "message": "Store \"newstore\" created successfully",
  "data": {
    "id": 3,
    "name": "newstore",
    "created_at": "2024-01-17T09:15:00Z"
  }
}
```

**Response (400 - Missing Name):**
```json
{
  "message": "Store name is required"
}
```

**Response (409 - Name Already Exists):**
```json
{
  "message": "Store with name 'newstore' already exists"
}
```

---

### POST /admin/update-store

Update a store's details.

**Authentication:** Required

**Request Body:**
```json
{
  "store_id": 1,
  "name": "updatedstore"
}
```

**Response (200 - Success):**
```json
{
  "message": "Store updated successfully",
  "data": {
    "id": 1,
    "name": "updatedstore",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Missing Fields):**
```json
{
  "message": "Store ID and name are required"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

**Response (409 - Name Already Exists):**
```json
{
  "message": "Store with name \"updatedstore\" already exists"
}
```

---

### POST /admin/delete-store

Delete a store and all its related data (API keys, credentials, logs).

**Authentication:** Required

**Request Body:**
```json
{
  "store_id": 1
}
```

**Response (200 - Success):**
```json
{
  "message": "Store \"gamestore1\" deleted successfully"
}
```

**Response (400 - Missing Store ID):**
```json
{
  "message": "Store ID is required"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

---

## API Key Management Endpoints

API keys are used to authenticate store requests to the game provider APIs. Each store can have one active API key.

### GET /admin/get-api-keys

Get the API key for a specific store.

**Authentication:** Required

**Query Parameters:**
- `store_id` (required): Store ID

**Example Request:**
```
GET /admin/get-api-keys?store_id=1
```

**Response (200 - Success):**
```json
{
  "message": "API key retrieved successfully",
  "data": {
    "api_key": {
      "id": 1,
      "store_id": 1,
      "api_key": "abc123...",
      "usage_count": 0,
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    "store": {
      "id": 1,
      "name": "gamestore1"
    }
  }
}
```

**Response (400 - Missing Store ID):**
```json
{
  "message": "Store ID is required as a query parameter"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

---

### POST /admin/manage-key

Create or update an API key for a store.

**Authentication:** Required

**Request Body:**
```json
{
  "store_id": 1
}
```

**Response (201 - Created):**
```json
{
  "message": "API key created for store: gamestore1",
  "data": {
    "id": 1,
    "store_id": 1,
    "api_key": "abc123...",
    "usage_count": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (200 - Updated):**
```json
{
  "message": "API key regenerated for store: gamestore1",
  "data": {
    "id": 1,
    "store_id": 1,
    "api_key": "def456...",
    "usage_count": 0,
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Missing Store ID):**
```json
{
  "message": "Store ID is required"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

---

## Provider Credential Management Endpoints

Provider credentials are used to authenticate with game provider APIs. Each store can have credentials for multiple providers.

### GET /admin/get-store-credentials

Get credentials for a specific store, optionally filtered by provider.

**Authentication:** Required

**Query Parameters:**
- `store_id` (required): Store ID
- `provider` (optional): Provider name to filter by

**Example Request:**
```
GET /admin/get-store-credentials?store_id=1&provider=gameroom
```

**Response (200 - All Credentials):**
```json
{
  "message": "Credentials retrieved successfully",
  "data": [
    {
      "id": 1,
      "store_id": 1,
      "provider": "GAMEROOM",
      "username": "user1",
      "password": "pass1",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "store_id": 1,
      "provider": "GAMEVAULT",
      "username": "user2",
      "password": "pass2",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Response (200 - Single Provider):**
```json
{
  "message": "Credential retrieved successfully",
  "data": {
    "id": 1,
    "store_id": 1,
    "provider": "GAMEROOM",
    "username": "user1",
    "password": "pass1",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Missing Store ID):**
```json
{
  "message": "Store ID is required as a query parameter"
}
```

**Response (400 - Invalid Provider):**
```json
{
  "message": "Invalid provider: gameroom"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

**Response (404 - Provider Not Configured):**
```json
{
  "message": "Provider GAMEROOM is not configured for this store"
}
```

---

### POST /admin/manage-credential

Create or update a provider credential for a store.

**Authentication:** Required

**Request Body:**
```json
{
  "store_id": 1,
  "provider": "gameroom",
  "username": "user1",
  "password": "pass1"
}
```

**Response (201 - Created):**
```json
{
  "message": "Credential created for GAMEROOM",
  "data": {
    "id": 1,
    "store_id": 1,
    "provider": "GAMEROOM",
    "username": "user1",
    "password": "pass1",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (200 - Updated):**
```json
{
  "message": "Credential updated for GAMEROOM",
  "data": {
    "id": 1,
    "store_id": 1,
    "provider": "GAMEROOM",
    "username": "user1",
    "password": "pass1",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

**Response (400 - Missing Fields):**
```json
{
  "message": "Store ID, provider, username and password are required"
}
```

**Response (400 - Invalid Provider):**
```json
{
  "message": "Invalid provider: gameroom"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

---

### POST /admin/delete-credential

Delete a provider credential.

**Authentication:** Required

**Request Body:**
```json
{
  "store_id": 1,
  "provider": "gameroom"
}
```

**Response (200 - Success):**
```json
{
  "message": "Credential deleted for GAMEROOM"
}
```

**Response (400 - Missing Fields):**
```json
{
  "message": "Store ID and provider are required"
}
```

**Response (400 - Invalid Provider):**
```json
{
  "message": "Invalid provider: gameroom"
}
```

**Response (404 - Store Not Found):**
```json
{
  "message": "Store with ID 1 not found"
}
```

**Response (404 - Provider Not Configured):**
```json
{
  "message": "Provider GAMEROOM is not configured for this store"
}
```

---

### GET /admin/get-providers

Get all available providers with their base URLs.

**Authentication:** Required

**Response (200):**
```json
{
  "message": "Providers retrieved successfully",
  "data": [
    {
      "name": "GAMEROOM",
      "base_url": "https://agentserver.gameroom777.com"
    },
    {
      "name": "GAMEVAULT",
      "base_url": "https://agent.gamevault999.com"
    }
  ]
}
```

---

## Logs and Monitoring Endpoints

These endpoints provide access to API usage logs and statistics for monitoring and debugging purposes.

### GET /admin/get-logs

Get API logs with pagination, filtering, and summary statistics.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Results per page (default: 50, max: 100)
- `store_id` (optional): Filter by store ID
- `provider` (optional): Filter by provider name
- `operation` (optional): Filter by operation type
- `is_successful` (optional): Filter by success status (true/false)
- `date_from` (optional): Start date in ISO format (YYYY-MM-DD)
- `date_to` (optional): End date in ISO format (YYYY-MM-DD)

**Example Requests:**
```# Get all logs with default pagination
GET /admin/get-logs

# Get logs for a specific store with custom pagination
GET /admin/get-logs?store_id=1&page=2&per_page=25

# Get successful logs for a specific provider
GET /admin/get-logs?provider=gameroom&is_successful=true

# Get logs within a date range
GET /admin/get-logs?date_from=2024-01-01&date_to=2024-01-31

# Get logs for a specific operation
GET /admin/get-logs?operation=get_user_balance

# Complex query with multiple filters
GET /admin/get-logs?store_id=1&provider=gameroom&is_successful=true&date_from=2024-01-01&date_to=2024-01-31&page=1&per_page=50
```

**Response (200 - Success):**
```json
{
  "message": "Logs retrieved successfully",
  "data": {
    "logs": [
      {
        "id": 1,
        "store_id": 1,
        "api_key_id": 1,
        "provider": "GAMEROOM",
        "operation": "get_user_balance",
        "is_successful": true,
        "description": "User balance fetched",
        "created_at": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "store_id": 1,
        "api_key_id": 1,
        "provider": "GAMEVAULT",
        "operation": "recharge",
        "is_successful": false,
        "description": "Insufficient balance",
        "created_at": "2024-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 50,
      "pages": 5
    },
    "summary": {
      "total_count": 250,
      "success_count": 240,
      "error_count": 10,
      "success_rate": 96.0
    }
  }
}
```

**Response (400 - Invalid Pagination):**
```json
{
  "message": "Page number must be a positive integer"
}
```

```json
{
  "message": "Per page must be between 1 and 100"
}
```

**Response (400 - Invalid Date Format):**
```json
{
  "message": "Invalid date_from format. Use ISO format (YYYY-MM-DD)"
}
```

**Response (400 - Invalid Date Format):**
```json
{
  "message": "Invalid date_to format. Use ISO format (YYYY-MM-DD)"
}
```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created (for new resources)
- **400**: Bad Request (missing/invalid parameters)
- **401**: Unauthorized (authentication required)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate resource)

---

## Usage Examples

### Complete Admin Workflow Example

```bash
# 1. Login
curl -X POST https://api.brui.cc/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your-password"}' \
  -c cookies.txt

# 2. Create a store
curl -X POST https://api.brui.cc/admin/create-store \
  -H "Content-Type: application/json" \
  -d '{"name": "newgamestore"}' \
  -b cookies.txt

# 3. Generate API key for the store
curl -X POST https://api.brui.cc/admin/manage-key \
  -H "Content-Type: application/json" \
  -d '{"store_id": 1}' \
  -b cookies.txt

# 4. Add provider credentials
curl -X POST https://api.brui.cc/admin/manage-credential \
  -H "Content-Type: application/json" \
  -d '{
    "store_id": 1,
    "provider": "gameroom",
    "username": "store_gameroom_user",
    "password": "provider_password"
  }' \
  -b cookies.txt

# 5. Check API logs
curl "https://api.brui.cc/admin/get-logs?store_id=1" \
  -b cookies.txt

# 6. Logout
curl -X POST https://api.brui.cc/admin/logout \
  -b cookies.txt
```

### JavaScript Example

```javascript
// Login function
async function adminLogin(username, password) {
  const response = await fetch('/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important for session cookies
    body: JSON.stringify({ username, password })
  });
  
  return await response.json();
}

// Get stores with search
async function getStores(searchTerm = '') {
  const url = searchTerm 
    ? `/admin/get-stores?search=${encodeURIComponent(searchTerm)}`
    : '/admin/get-stores';
    
  const response = await fetch(url, {
    credentials: 'include'
  });
  
  return await response.json();
}

// Create new store
async function createStore(name) {
  const response = await fetch('/admin/create-store', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ name })
  });
  
  return await response.json();
}

// Generate API key
async function generateAPIKey(storeId) {
  const response = await fetch('/admin/manage-key', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ store_id: storeId })
  });
  
  return await response.json();
}

// Add provider credential
async function addProviderCredential(storeId, provider, username, password) {
  const response = await fetch('/admin/manage-credential', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      store_id: storeId,
      provider: provider,
      username: username,
      password: password
    })
  });
  
  return await response.json();
}
```

---
