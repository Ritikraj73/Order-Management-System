# Distributed Order Management System (OMS)

A production-quality full-stack microservices application for order management with authentication, product management, order processing, inventory management, and notification services.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              API Gateway (8080)                         │
│                         JWT Validation, Routing                         │
└─────────────────────────────────────────────────────────────────────────┘
                    │           │           │           │           │
                    ▼           ▼           ▼           ▼           ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
            │  Auth    │ │ Product  │ │  Order   │ │Inventory │ │ Notification│
            │ Service  │ │ Service  │ │ Service  │ │ Service  │ │  Service    │
            │  (8081)  │ │  (8082)  │ │  (8083)  │ │  (8084)  │ │   (8085)    │
            └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘
                 │            │            │            │              │
                 │            │            │            │              │
                 ▼            ▼            ▼            ▼              ▼
            ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────────┐
            │PostgreSQL│  │PostgreSQL│  │PostgreSQL│  │PostgreSQL│  │ PostgreSQL │
            │ auth_db │   │product_db│  │ order_db│  │inventory_db│ │notif_db   │
            └────────┘   └────────┘   └────────┘   └────────┘   └────────────┘
                              │
                              ▼
                        ┌────────┐
                        │ Redis  │
                        │ Cache  │
                        └────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           Kafka (Message Broker)                        │
│                    order-created-events topic                           │
└─────────────────────────────────────────────────────────────────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **API Gateway** | 8080 | Routes requests, validates JWT tokens |
| **Auth Service** | 8081 | User registration, login, JWT generation |
| **Product Service** | 8082 | Product CRUD with Redis caching |
| **Order Service** | 8083 | Order creation, transactional processing |
| **Inventory Service** | 8084 | Stock management with optimistic locking |
| **Notification Service** | 8085 | Kafka consumer, notification handling |

## Database Schema

### Auth Service (auth_db)
```sql
users: id, username, email, password, role, created_at
```

### Product Service (product_db)
```sql
products: id, name, description, price, category, created_at, updated_at
```

### Order Service (order_db)
```sql
orders: id, user_id, status, total_amount, created_at
order_items: id, order_id, product_id, quantity, price
```

### Inventory Service (inventory_db)
```sql
inventory: product_id, quantity, version
```

### Notification Service (notification_db)
```sql
notifications: id, user_id, order_id, type, subject, message, status, sent_at, created_at
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/users` | List all users (ADMIN only) |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | List products (paginated) |
| GET | `/products/{id}` | Get product by ID |
| POST | `/products` | Create product (ADMIN) |
| PUT | `/products/{id}` | Update product (ADMIN) |
| DELETE | `/products/{id}` | Delete product (ADMIN) |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/orders` | Create order (USER) |
| GET | `/orders` | List user orders (USER) |
| GET | `/orders/{id}` | Get order details (USER) |

### Inventory
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/inventory/reserve` | Reserve stock |
| GET | `/inventory/{productId}` | Get stock level |

## End-to-End Flow

1. **User Registration/Login**
   - POST `/auth/register` or `/auth/login`
   - Returns JWT token
   - Token must be included in `Authorization: Bearer <token>` header

2. **Browse Products**
   - GET `/products?page=0&size=10`
   - Products are cached in Redis

3. **Place Order** (Critical Flow)
   - POST `/orders` with items
   - Order Service calls Product Service to get prices (never trust client)
   - Order Service calls Inventory Service to reserve stock
   - Order is saved in a transaction
   - Kafka event `OrderCreatedEvent` is published

4. **Notification**
   - Notification Service consumes `OrderCreatedEvent` from Kafka
   - Notification is created and "sent" (simulated)

## Setup Instructions

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+
- Docker & Docker Compose (for containerized setup)

### Local Development Setup

1. **Start Infrastructure**
   ```bash
   # Start PostgreSQL, Redis, Kafka via Docker
   docker-compose up -d postgres-auth postgres-product postgres-order postgres-inventory postgres-notification redis kafka
   ```

2. **Start Backend Services** (in separate terminals)
   ```bash
   # Auth Service
   cd auth-service && mvn spring-boot:run

   # Product Service
   cd product-service && mvn spring-boot:run

   # Inventory Service
   cd inventory-service && mvn spring-boot:run

   # Order Service
   cd order-service && mvn spring-boot:run

   # Notification Service
   cd notification-service && mvn spring-boot:run

   # API Gateway
   cd api-gateway && mvn spring-boot:run
   ```

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Setup (Full Stack)

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Environment Variables

```env
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5437

# JWT
JWT_SECRET=oms-secret-key-for-jwt-token-generation-must-be-at-least-256-bits-long
JWT_EXPIRATION=86400000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
```

## Sample API Requests

### Register User
```bash
curl -X POST http://localhost:8081/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST http://localhost:8081/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

### Create Product (Admin)
```bash
curl -X POST http://localhost:8082/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Test Product","description":"A test product","price":99.99,"category":"Electronics"}'
```

### Place Order
```bash
curl -X POST http://localhost:8083/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"items":[{"productId":1,"quantity":2}]}'
```

## Project Structure

```
oms/
├── auth-service/         # Authentication microservice
├── product-service/      # Product management microservice
├── order-service/        # Order processing microservice
├── inventory-service/    # Stock management microservice
├── notification-service/ # Kafka consumer microservice
├── api-gateway/          # Spring Cloud Gateway
├── frontend/             # React application
├── docker-compose.yml    # Docker Compose configuration
├── README.md             # This file
├── BUILD_STEPS.md        # Implementation guide
└── SPEC.md               # System specification
```

## Testing

```bash
# Run unit tests for all services
cd <service> && mvn test

# Run integration tests
mvn verify -DskipITs=false
```

## Security

- JWT-based authentication
- Role-based authorization (USER, ADMIN)
- Password encryption with BCrypt
- Optimistic locking for concurrent inventory updates

## Monitoring

- Actuator endpoints available at `/actuator/health` for each service
- Correlation ID support via `X-Correlation-ID` header