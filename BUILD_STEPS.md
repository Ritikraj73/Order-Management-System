# Build Steps - Order Management System

This guide provides step-by-step instructions for implementing and running the OMS system.

## Phase 1: Core Services (Foundation)

### Step 1.1: Auth Service (8081)

**Purpose:** JWT-based authentication and user management

**Key Files:**
- `AuthService.java` - Business logic for registration/login
- `SecurityConfig.java` - Spring Security configuration
- `JwtUtil.java` - JWT token generation and validation
- `JwtAuthenticationFilter.java` - JWT filter for request authentication

**Implementation:**
1. Create User entity with id, username, email, password, role
2. Create UserRepository with findByUsername/Email methods
3. Implement AuthService with register/login methods
4. Configure Spring Security with JWT filter
5. Add Flyway migration V1__create_users_table.sql

**Endpoints:**
- POST `/auth/register` - Register new user
- POST `/auth/login` - Login, returns JWT token
- GET `/auth/users` - List users (ADMIN only)

**Testing:**
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"admin123","role":"ADMIN"}'

curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

### Step 1.2: Product Service (8082)

**Purpose:** Product CRUD with Redis caching

**Key Files:**
- `ProductService.java` - Business logic with @Cacheable/@CacheEvict
- `ProductController.java` - REST endpoints
- `RedisConfig.java` - Redis cache configuration

**Implementation:**
1. Create Product entity with id, name, description, price, category
2. Create ProductRepository with pagination and filtering
3. Implement ProductService with cache annotations
4. Configure Redis for caching (TTL: 10 minutes)
5. Add Flyway migration V1__create_products_table.sql with sample data

**Endpoints:**
- GET `/products?page=0&size=10&category=Electronics` - List products
- GET `/products/{id}` - Get product by ID
- POST `/products` - Create product (ADMIN only)
- PUT `/products/{id}` - Update product (ADMIN only)
- DELETE `/products/{id}` - Delete product (ADMIN only)

**Testing:**
```bash
curl http://localhost:8082/products

curl -X POST http://localhost:8082/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Laptop","description":"Gaming laptop","price":1299.99,"category":"Electronics"}'
```

---

### Step 1.3: Order Service (8083)

**Purpose:** Order creation with transactional flow

**Critical Flow:**
1. Extract user from JWT
2. Call Product Service for prices (NEVER trust client)
3. Call Inventory Service to reserve stock
4. Save Order + OrderItems in single transaction
5. Publish OrderCreatedEvent to Kafka

**Key Files:**
- `OrderService.java` - Transactional order creation
- `ProductClient.java` - Feign client to Product Service
- `InventoryClient.java` - Feign client to Inventory Service
- `OrderEventProducer.java` - Kafka producer

**Implementation:**
1. Create Order and OrderItem entities
2. Create OrderRepository
3. Implement Feign clients for inter-service communication
4. Implement OrderService with @Transactional
5. Add Kafka producer for OrderCreatedEvent
6. Add Flyway migration V1__create_orders_table.sql

**Endpoints:**
- POST `/orders` - Create order
- GET `/orders` - List user orders
- GET `/orders/{id}` - Get order details

**Testing:**
```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

---

## Phase 2: Enhancement Services

### Step 2.1: Inventory Service (8084)

**Purpose:** Stock management with optimistic locking

**Key Files:**
- `InventoryService.java` - Stock reservation with @Version
- `InventoryController.java` - REST endpoints
- `Inventory.java` - Entity with @Version for optimistic locking

**Implementation:**
1. Create Inventory entity with productId, quantity, @Version
2. Create InventoryRepository with reserveStock query
3. Implement InventoryService with optimistic locking
4. Handle OptimisticLockException (HTTP 409)
5. Add Flyway migration V1__create_inventory_table.sql with sample data

**Endpoints:**
- POST `/inventory/reserve` - Reserve stock
- GET `/inventory/{productId}` - Get stock level
- POST `/inventory/stock?productId=1&quantity=50` - Add stock

**Testing:**
```bash
curl -X POST http://localhost:8084/inventory/reserve \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":5}'
```

**Concurrency Handling:**
- Uses @Version for optimistic locking
- Returns HTTP 409 on concurrent modification
- Retry mechanism should be implemented on client side

---

### Step 2.2: Kafka Setup

**Topics:**
- `order-created-events` - Published by Order Service, consumed by Notification Service

**Configuration:**
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
    consumer:
      group-id: notification-group
      auto-offset-reset: earliest
```

---

### Step 2.3: Notification Service (8085)

**Purpose:** Consume order events from Kafka, create notifications

**Key Files:**
- `OrderEventConsumer.java` - Kafka listener
- `NotificationService.java` - Notification creation
- `Notification.java` - Entity

**Implementation:**
1. Create Notification entity
2. Create NotificationRepository
3. Implement OrderEventConsumer with @KafkaListener
4. Implement NotificationService to "send" notifications (log)
5. Add Flyway migration V1__create_notifications_table.sql

**Kafka Event Structure:**
```json
{
  "orderId": 1,
  "userId": 1,
  "username": "testuser",
  "totalAmount": 199.98,
  "items": [
    {"productId": 1, "productName": "Laptop", "quantity": 2, "price": 99.99}
  ],
  "createdAt": "2024-01-15T10:30:00"
}
```

---

## Phase 3: Integration

### Step 3.1: API Gateway (8080)

**Purpose:** Route requests, validate JWT, add correlation IDs

**Key Files:**
- `application.yml` - Route configuration
- `JwtAuthenticationFilter.java` - JWT validation filter

**Implementation:**
1. Configure Spring Cloud Gateway routes
2. Implement JWT filter for authentication
3. Add correlation ID support

**Routes:**
```yaml
routes:
  - id: auth-service
    uri: http://localhost:8081
    predicates: [Path=/auth/**]
  - id: product-service
    uri: http://localhost:8082
    predicates: [Path=/products/**]
  - id: order-service
    uri: http://localhost:8083
    predicates: [Path=/orders/**]
  - id: inventory-service
    uri: http://localhost:8084
    predicates: [Path=/inventory/**]
  - id: notification-service
    uri: http://localhost:8085
    predicates: [Path=/notifications/**]
```

---

### Step 3.2: Docker Setup

**Services:**
1. 5x PostgreSQL (one per service)
2. Redis (for caching)
3. Kafka + Zookeeper
4. 6x Spring Boot microservices
5. Frontend (optional)

**Commands:**
```bash
# Start infrastructure
docker-compose up -d postgres-auth postgres-product postgres-order postgres-inventory postgres-notification redis kafka

# Build and run a service
docker build -t oms-auth-service ./auth-service
docker run -p 8081:8081 oms-auth-service

# Full stack
docker-compose up -d
```

---

### Step 3.3: Frontend (React)

**Pages:**
1. Login/Register - Authentication
2. Products - Product listing with pagination
3. Admin Products - CRUD for products
4. Cart - Shopping cart
5. Orders - Order history

**Key Components:**
- `AuthContext.jsx` - Authentication state management
- `api.js` - Axios instance with interceptors
- `Products.jsx` - Paginated product listing
- `Cart.jsx` - Place orders

---

## Common Issues and Fixes

### Issue 1: Flyway Migration Fails
**Problem:** Tables already exist or migration errors
**Fix:** Delete database and let Flyway recreate, or use `baseline-on-migrate: true`

### Issue 2: JWT Validation Fails
**Problem:** Clock skew, wrong secret
**Fix:** Ensure all services use same JWT_SECRET, check system time

### Issue 3: Feign Client Connection Refused
**Problem:** Service not started or wrong URL
**Fix:** Ensure services start in order (auth → product → inventory → order → notification), check services.product.url and services.inventory.url in order-service

### Issue 4: Kafka Consumer Not Receiving Events
**Problem:** Consumer group not matching, topic not created
**Fix:** Ensure kafka.auto.create.topics.enable=true, check consumer group-id

### Issue 5: Redis Cache Not Working
**Problem:** Redis not running or wrong host/port
**Fix:** Check REDIS_HOST and REDIS_PORT environment variables

### Issue 6: Optimistic Lock Exception (HTTP 409)
**Problem:** Concurrent inventory update
**Fix:** Implement retry logic in Order Service, this is expected behavior for concurrent requests

---

## Verification Checklist

- [ ] Auth Service: Register/Login returns JWT
- [ ] Product Service: CRUD operations work with caching
- [ ] Inventory Service: Stock reservation with version control
- [ ] Order Service: Order creation flow works end-to-end
- [ ] Notification Service: Kafka events are consumed
- [ ] API Gateway: Routes requests correctly
- [ ] Frontend: Can register, login, view products, place orders

---

## End-to-End Test Flow

1. Register admin user:
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@test.com","password":"admin123","role":"ADMIN"}'
```

2. Create products (as admin):
```bash
# Use token from login
curl -X POST http://localhost:8082/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Product","price":99.99,"category":"Electronics"}'
```

3. Add inventory:
```bash
curl -X POST "http://localhost:8084/inventory/stock?productId=1&quantity=100"
```

4. Place order (as user):
```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

5. Verify notification:
- Check notification_service logs for consumed event