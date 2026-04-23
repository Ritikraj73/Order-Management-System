# Distributed Order Management System (OMS) - Specification

## 1. Project Overview

**Project Name:** Distributed Order Management System (OMS)
**Type:** Full-stack microservices application
**Core Functionality:** A production-quality order management system with authentication, product management, order processing, inventory management, and notification services.
**Target Users:** E-commerce businesses requiring scalable order processing with admin and user roles.

---

## 2. Architecture Overview

### 2.1 Backend Services (Java 17 + Spring Boot)

| Service | Port | Purpose | Database |
|---------|------|---------|----------|
| auth-service | 8081 | JWT authentication, user management | PostgreSQL (auth_db) |
| product-service | 8082 | Product CRUD, Redis caching | PostgreSQL (product_db) |
| order-service | 8083 | Order processing, transactional flow | PostgreSQL (order_db) |
| inventory-service | 8084 | Stock management, optimistic locking | PostgreSQL (inventory_db) |
| notification-service | 8085 | Kafka consumer, event handling | PostgreSQL (notification_db) |
| api-gateway | 8080 | Request routing, JWT validation | - |

### 2.2 Frontend
- **Framework:** React (Vite)
- **Pages:** Login, Register, Products, Admin Management, Cart, Order History

### 2.3 Infrastructure
- **Databases:** PostgreSQL (per service)
- **Cache:** Redis (product caching)
- **Message Broker:** Apache Kafka
- **Containerization:** Docker + Docker Compose

---

## 3. Implementation Phases

### Phase 1 (Foundation)
- [ ] auth-service (JWT, roles: ADMIN/USER)
- [ ] product-service (CRUD, pagination, filtering)
- [ ] order-service (order creation, transactional flow)
- [ ] PostgreSQL setup with Flyway migrations

### Phase 2 (Enhancement)
- [ ] inventory-service (stock management, @Version)
- [ ] Kafka setup
- [ ] notification-service (Kafka consumer)
- [ ] Redis caching for products

### Phase 3 (Integration)
- [ ] api-gateway (Spring Cloud Gateway)
- [ ] Docker Compose setup
- [ ] React frontend integration
- [ ] End-to-end testing

---

## 4. Database Design

### Users (auth-service)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Products (product-service)
```sql
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory (inventory-service)
```sql
CREATE TABLE inventory (
    product_id BIGINT PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    version BIGINT DEFAULT 0
);
```

### Orders (order-service)
```sql
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id),
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL
);
```

---

## 5. API Endpoints

### Auth Service (8081)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /auth/register | Register new user | Public |
| POST | /auth/login | Login, returns JWT | Public |
| GET | /auth/users | List all users | ADMIN |

### Product Service (8082)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /products | List products (paginated) | Public |
| GET | /products/{id} | Get product by ID | Public |
| POST | /products | Create product | ADMIN |
| PUT | /products/{id} | Update product | ADMIN |
| DELETE | /products/{id} | Delete product | ADMIN |

### Order Service (8083)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /orders | Create order | USER |
| GET | /orders | List user orders | USER |
| GET | /orders/{id} | Get order details | USER |

### Inventory Service (8084)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /inventory/reserve | Reserve stock | USER |
| GET | /inventory/{productId} | Get stock level | USER |

### API Gateway (8080)
- Routes all requests to appropriate services
- Validates JWT tokens
- Adds correlation IDs

---

## 6. Core Flows

### 6.1 Authentication Flow
1. User registers → saved to PostgreSQL (BCrypt password)
2. User logs in → returns JWT with role claim
3. All subsequent requests include JWT in Authorization header
4. API Gateway validates JWT before routing

### 6.2 Order Creation Flow (CRITICAL)
1. User sends POST /orders with product IDs and quantities
2. Extract user from JWT token
3. Call product-service to fetch product details (NEVER trust client price)
4. Calculate total server-side
5. Call inventory-service to reserve stock (optimistic locking)
6. If stock available, save Order + OrderItems in single transaction
7. Publish OrderCreatedEvent to Kafka
8. Return order confirmation to user

### 6.3 Notification Flow
1. notification-service consumes OrderCreatedEvent from Kafka
2. Log or simulate email sending
3. Update notification record in database

---

## 7. Inter-Service Communication

### REST Communication
- **Order Service → Product Service:** Fetch product details/price
- **Order Service → Inventory Service:** Reserve/release stock

### Event-Driven (Kafka)
- **Order Service → Notification Service:** OrderCreatedEvent

---

## 8. Production Features

- **Layered Architecture:** Controller → Service → Repository → DTO → Entity
- **Global Exception Handling:** @ControllerAdvice for consistent error responses
- **Validation:** JSR-303 annotations (@NotNull, @Email, @Min, @Max)
- **Logging:** SLF4J with correlation ID (X-Correlation-ID header)
- **Pagination:** Spring Data Pageable support
- **Caching:** Redis @Cacheable for product reads
- **Concurrency:** @Version for optimistic locking in inventory

---

## 9. Environment Variables

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5437

# Services
AUTH_SERVICE_URL=http://localhost:8081
PRODUCT_SERVICE_URL=http://localhost:8082
ORDER_SERVICE_URL=http://localhost:8083
INVENTORY_SERVICE_URL=http://localhost:8084
NOTIFICATION_SERVICE_URL=http://localhost:8085

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# JWT
JWT_SECRET=your-256-bit-secret-key-here-must-be-long-enough
JWT_EXPIRATION=86400000

# Gateway
API_GATEWAY_PORT=8080
```

---

## 10. Docker Services

- **PostgreSQL:** 6 instances (one per service)
- **Redis:** Single instance for caching
- **Kafka + Zookeeper:** Message broker
- **All microservices:** 6 Java applications

---

## 11. Acceptance Criteria

### Authentication
- [ ] Users can register with username, email, password
- [ ] Users can login and receive JWT token
- [ ] ADMIN users can manage products
- [ ] USER users can place orders

### Product Service
- [ ] Products are paginated (default 10 per page)
- [ ] Products can be filtered by category
- [ ] Product reads are cached in Redis
- [ ] Cache is invalidated on product update

### Order Service
- [ ] Order creation is transactional (all or nothing)
- [ ] Server-side price calculation (no client trust)
- [ ] Concurrent inventory updates handled with optimistic locking
- [ ] HTTP 409 returned on inventory conflict

### Infrastructure
- [ ] All services run locally without Docker
- [ ] Docker Compose available for full deployment
- [ ] API documentation provided with sample requests

---

## 12. Testing Requirements

- Unit tests for service layer using JUnit + Mockito
- Minimum 70% code coverage for core business logic
- Integration tests for critical flows (order creation)

---

## 13. Deliverables

1. **Backend:** 6 Spring Boot microservices
2. **Frontend:** React application
3. **Database:** Flyway migrations for all services
4. **Deployment:** Docker Compose configuration
5. **Documentation:**
   - README.md (architecture, setup, API endpoints)
   - BUILD_STEPS.md (implementation guide)
   - Postman collection (sample requests)