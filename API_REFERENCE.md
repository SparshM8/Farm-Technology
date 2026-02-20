# Farming Tech Shop - API Reference

**Base URL**: `http://localhost:3000/api` (development) or `https://yourdomain.com/api` (production)

## Authentication

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Farmer",
  "password": "securePassword123",
  "phone": "9876543210"
}

Response 201:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Farmer",
    "phone": "9876543210"
  }
}
```

### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response 200:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Farmer",
    "is_admin": false
  }
}
```

## Products

### Get All Products
```http
GET /products
GET /products?category=seeds
GET /products?search=fertilizer
GET /products?limit=20&offset=0

Response 200:
[
  {
    "id": "uuid",
    "name": "Organic Fertilizer",
    "category": "fertilizers",
    "price": 450,
    "description": "High-quality organic fertilizer...",
    "stock": 100,
    "rating": 4.5,
    "total_reviews": 12,
    "created_at": "2026-02-20T10:00:00Z"
  }
]
```

### Get Product Details
```http
GET /products/:productId

Response 200:
{
  "id": "uuid",
  "name": "Organic Fertilizer",
  "category": "fertilizers",
  "price": 450,
  "description": "High-quality organic fertilizer...",
  "stock": 100,
  "rating": 4.5,
  "total_reviews": 12,
  "reviews": [
    {
      "id": "uuid",
      "rating": 5,
      "title": "Excellent product",
      "comment": "Very effective for my crops",
      "name": "Farmer Name",
      "created_at": "2026-02-20T10:00:00Z"
    }
  ],
  "created_at": "2026-02-20T10:00:00Z"
}
```

### Get All Categories
```http
GET /products/categories/all

Response 200:
[
  "fertilizers",
  "pesticides",
  "seeds",
  "tools",
  "equipment"
]
```

### Add Product Review (requires auth)
```http
POST /products/:productId/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "title": "Great product",
  "comment": "Works perfectly"
}

Response 201:
{
  "success": true,
  "reviewId": "uuid"
}
```

## Shopping Cart

### Get Cart (requires auth)
```http
GET /cart
Authorization: Bearer <token>

Response 200:
{
  "cart": {
    "id": "uuid",
    "user_id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product_id": "uuid",
        "quantity": 2,
        "name": "Organic Fertilizer",
        "price": 450
      }
    ],
    "total": 900,
    "created_at": "2026-02-20T10:00:00Z"
  }
}
```

### Add to Cart (requires auth)
```http
POST /cart/items
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "uuid",
  "quantity": 2
}

Response 201:
{
  "success": true
}
```

### Update Cart Item (requires auth)
```http
PUT /cart/items/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}

Response 200:
{
  "success": true
}
```

### Remove from Cart (requires auth)
```http
DELETE /cart/items/:itemId
Authorization: Bearer <token>

Response 200:
{
  "success": true
}
```

### Clear Cart (requires auth)
```http
DELETE /cart
Authorization: Bearer <token>

Response 200:
{
  "success": true
}
```

## Orders

### Create Order (requires auth)
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "shippingAddress": "123 Farm Lane, Village, State 12345",
  "paymentMethod": "card"
}

Response 201:
{
  "success": true,
  "orderId": "uuid",
  "orderNumber": "ORD-1645345600-abc123",
  "totalAmount": 2500
}
```

### Get User Orders (requires auth)
```http
GET /orders
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "order_number": "ORD-1645345600-abc123",
    "total_amount": 2500,
    "final_amount": 2500,
    "status": "pending",
    "payment_status": "pending",
    "created_at": "2026-02-20T10:00:00Z"
  }
]
```

### Get Order Details (requires auth)
```http
GET /orders/:orderId
Authorization: Bearer <token>

Response 200:
{
  "id": "uuid",
  "order_number": "ORD-1645345600-abc123",
  "user_id": "uuid",
  "total_amount": 2500,
  "final_amount": 2500,
  "status": "pending",
  "payment_method": "card",
  "payment_status": "pending",
  "shipping_address": "123 Farm Lane...",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 450,
      "name": "Organic Fertilizer"
    }
  ],
  "created_at": "2026-02-20T10:00:00Z"
}
```

## Contact Form

### Submit Contact
```http
POST /contact
Content-Type: application/json

{
  "name": "John Farmer",
  "email": "john@farm.com",
  "phone": "9876543210",
  "subject": "Product Inquiry",
  "message": "I have questions about your fertilizer..."
}

Response 201:
{
  "success": true,
  "message": "Thank you for contacting us. We will get back to you soon!"
}
```

## Admin Endpoints

### Get Dashboard Stats (requires admin auth)
```http
GET /admin/dashboard/stats
Authorization: Bearer <token>

Response 200:
{
  "totalOrders": 42,
  "totalRevenue": 125000,
  "pendingOrders": 5,
  "totalProducts": 12
}
```

### Create Product (requires admin auth)
```http
POST /admin/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Product",
  "category": "seeds",
  "price": 299.99,
  "description": "Product description...",
  "stock": 100,
  "sku": "NEW-PROD-001"
}

Response 201:
{
  "success": true,
  "productId": "uuid"
}
```

### Update Product (requires admin auth)
```http
PUT /admin/products/:productId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 349.99,
  "stock": 75
}

Response 200:
{
  "success": true
}
```

### Delete Product (requires admin auth)
```http
DELETE /admin/products/:productId
Authorization: Bearer <token>

Response 200:
{
  "success": true
}
```

### Get All Orders (requires admin auth)
```http
GET /admin/orders
GET /admin/orders?status=pending
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "order_number": "ORD-...",
    "total_amount": 2500,
    "status": "pending",
    "created_at": "2026-02-20T10:00:00Z"
  }
]
```

### Update Order Status (requires admin auth)
```http
PUT /admin/orders/:orderId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "shipped"
}

Response 200:
{
  "success": true
}
```

Valid statuses: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

### Get Contact Submissions (requires admin auth)
```http
GET /admin/contacts
Authorization: Bearer <token>

Response 200:
[
  {
    "id": "uuid",
    "name": "John Farmer",
    "email": "john@farm.com",
    "subject": "Inquiry",
    "message": "...",
    "status": "new",
    "created_at": "2026-02-20T10:00:00Z"
  }
]
```

### Update Contact Status (requires admin auth)
```http
PUT /admin/contacts/:contactId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "responded"
}

Response 200:
{
  "success": true
}
```

## Health Check

### Health Status
```http
GET /health

Response 200:
{
  "status": "OK",
  "timestamp": "2026-02-20T10:00:00Z",
  "environment": "production"
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields",
  "errors": {
    "email": "Invalid email format",
    "password": "Minimum 6 characters required"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "Admin access required"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 409 Conflict
```json
{
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `RateLimit-Limit: 100`
  - `RateLimit-Remaining: 95`
  - `RateLimit-Reset: 1234567890`

## Authentication

Include token in Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token expires in 7 days.

## CORS

Allowed origins (configurable):
- `http://localhost:5173` (development)
- `http://localhost:3000` (development)
- `https://yourdomain.com` (production)

---

For more information, see README.md and PRODUCTION_GUIDE.md.
