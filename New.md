Shopzy - Distributed E-Commerce Platform
A production-quality full-stack microservices application built with modern Material UI design, featuring authentication, product catalog, shopping cart, order processing, inventory management, and real-time notifications.

🎯 Key Features
Backend
JWT Authentication with userId and role claims
API Gateway with automatic user context injection (X-User-Id, X-User-Role headers)
Event-Driven Architecture using Apache Kafka
Optimistic Locking for inventory management
Real-time Notifications via Kafka consumers
Dockerized microservices with Docker Compose
Frontend (Material UI)
Modern UI Design with Material-UI components
Dark Mode Support with theme persistence
Responsive Layout - Mobile-first design with collapsible sidebar
Product Images - Visual product catalog with real images
Interactive Shopping Cart with quantity controls
Toast Notifications for user feedback
Loading States with skeleton loaders
Confirmation Dialogs for important actions
Empty States with helpful messaging
Architecture Overview
┌──────────────────────┐
│   Shopzy Frontend    │
│   Material-UI + Vite │
│   (Port: 3000)       │
└──────────┬───────────┘
│
│ All API calls proxied through API Gateway
▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         API Gateway (8080)                              │
│         JWT Validation, User Context Injection, Request Routing         │
│         Extracts userId & role from JWT → Adds X-User-Id, X-User-Role   │
└─────────────────────────────────────────────────────────────────────────┘
│           │           │           │           │
▼           ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐
│  Auth    │ │ Product  │ │  Order   │ │Inventory │ │ Notification│
│ Service  │ │ Service  │ │ Service  │ │ Service  │ │  Service    │
│  (8081)  │ │  (8082)  │ │  (8083)  │ │  (8084)  │ │   (8085)    │
└────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘
│            │         │   │         │              │
│            │         │   │         │              │
▼            ▼         ▼   │         ▼              ▼
┌────────┐   ┌────────┐ ┌────────┐   ┌────────┐   ┌────────────┐
│PostgreSQL│  │PostgreSQL│ │PostgreSQL│  │PostgreSQL│  │ PostgreSQL │
│ auth_db │   │product_db│ │ order_db│  │inventory_db│ │notification│
│ :5432   │   │  :5433  │ │  :5434  │  │  :5435    │ │_db  :5436  │
└────────┘   └────┬─────┘ └────────┘   └────────┘   └────────────┘
│
▼
┌────────┐
│ Redis  │
│ :6379  │
└────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│              Kafka + Zookeeper (Event-Driven Architecture)               │
│  Broker: kafka:9092 (internal), localhost:9092 (external)               │
│  Topics: order-created-events                                            │
│  Order Service (Producer) → Notification Service (Consumer)             │
└──────────────────────────────────────────────────────────────────────────┘
Services
Service	Port	Description	Key Features
API Gateway	8080	Routes requests, validates JWT	JWT validation, header injection
Auth Service	8081	User registration, login	JWT with userId/role claims
Product Service	8082	Product CRUD	Redis caching
Order Service	8083	Order creation, management	Kafka producer, inventory integration
Inventory Service	8084	Stock management	Optimistic locking (version field)
Notification Service	8085	Notification handling	Kafka consumer
Frontend (Shopzy)	3000	React SPA with Material-UI	Dark mode, responsive design, MUI
🎨 Frontend Technologies
React 18 - Modern React with hooks
Material-UI (MUI) v5 - Complete UI component library
@mui/icons-material - Comprehensive icon set
Emotion - CSS-in-JS styling
React Router v6 - Client-side routing
Axios - HTTP client with interceptors
Vite - Lightning-fast build tool
Context API - State management (Auth, Theme, Notifications)
🚀 Quick Start (Docker - Recommended)
Prerequisites
Docker & Docker Compose
8GB+ RAM recommended
Steps
Clone the repository

git clone <repository-url>
cd Order-Management-System
Build and start all services

docker-compose up -d --build
This will start:

5 PostgreSQL databases
Redis cache
Kafka + Zookeeper
6 microservices (auth, product, order, inventory, notification, api-gateway)
Start the frontend

cd frontend
npm install
npm run dev
Access Shopzy

Frontend: http://localhost:3000
API Gateway: http://localhost:8080
Features:
Browse products with images
Toggle dark/light mode
Add items to cart
Place orders
View order history
Admin product management (ADMIN role)
Monitor logs

# All services
docker-compose logs -f

# Specific service
docker logs oms-order-service -f
docker logs oms-notification-service -f
🎨 UI Features
Material-UI Components
AppLayout - Responsive layout with collapsible sidebar navigation
ProductCard - Product display with images, pricing, and stock status
CartItem - Interactive cart item with quantity controls
OrderCard - Order history with status tracking
ConfirmDialog - Reusable confirmation dialogs
LoadingSkeleton - Skeleton loaders for better UX
Theme Support
Light/Dark Mode - Toggle between themes with persistent preference
Custom Theme - Brand colors (#2c3e50 primary, #3498db secondary)
Responsive Design - Mobile-first with breakpoints for all screen sizes
User Experience
Toast Notifications - Success/error messages using Snackbar
Loading States - Skeleton loaders during data fetching
Empty States - Helpful messages when no data is available
Form Validation - Real-time validation with error states
Hover Effects - Interactive cards with elevation changes
Badge Indicators - Cart count badge in navigation
📋 Complete Order Flow (End-to-End)
1. User Registration & Login
   Navigate to http://localhost:3000
   Register: username, email, password (creates USER role by default)
   Login: Returns JWT token stored in localStorage
   Token contains: {subject: "username", claims: {userId: Long, role: "USER"}}
2. Browse Products
   View product catalog
   Products cached in Redis for performance
   Search and filter capabilities
3. Add to Cart & Place Order
   Client-Side:

Add products to cart (stored in React state)
Click "Place Order"
Frontend sends POST /orders with Authorization header
Server-Side Flow:

API Gateway validates JWT, extracts userId → adds X-User-Id header
Order Service receives request with userId from header
Fetches product details from Product Service (price validation)
Calls Inventory Service POST /inventory/reserve for each item
If stock available → creates Order with PENDING status
Publishes Kafka event OrderCreatedEvent to topic order-created-events
Returns order confirmation to client
4. Inventory Management
   Inventory uses optimistic locking with version field
   Concurrent reservations handled safely
   Stock decremented atomically: UPDATE inventory SET quantity = quantity - ?, version = version + 1 WHERE product_id = ? AND version = ?
5. Notification Processing
   Notification Service consumes OrderCreatedEvent from Kafka
   Builds order confirmation message with item details
   Creates notification in database with type ORDER_CONFIRMATION
   Marks as SENT (simulated delivery)
   User can view notifications at /notifications
   🔧 Configuration Details
   JWT Configuration
   Token Claims:

{
"sub": "username",
"userId": 5,
"role": "USER",
"iat": 1777030000,
"exp": 1777116400
}
API Gateway Filter:

Validates JWT signature
Extracts userId and role from claims
Injects headers: X-User-Id: 5, X-User-Role: USER
Services read userId from header (no JWT parsing needed)
Kafka Configuration
Docker Environment (Inside Containers):

KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
SPRING_KAFKA_BOOTSTRAP_SERVERS: kafka:9092
Application Configuration:

spring:
kafka:
bootstrap-servers: ${SPRING_KAFKA_BOOTSTRAP_SERVERS:kafka:9092}
consumer:
properties:
spring.json.use.type.headers: false
spring.json.value.default.type: com.oms.notification.kafka.OrderCreatedEvent
Why this matters:

Kafka advertises itself as kafka:9092 (container name)
Services inside Docker network connect to kafka:9092
External access (from host) uses localhost:9092
Frontend Proxy Configuration (vite.config.js)
server: {
port: 3000,
proxy: {
'/auth': 'http://localhost:8080',
'/products': 'http://localhost:8080',
'/orders': 'http://localhost:8080',
'/inventory': 'http://localhost:8080',
'/notifications': 'http://localhost:8080'
}
}
All API calls routed through API Gateway for consistent JWT validation.

Database Schema
Auth Service (auth_db)
users: id, username, email, password, role, created_at
Product Service (product_db)
products: id, name, description, price, category, created_at, updated_at
Order Service (order_db)
orders: id, user_id, status, total_amount, created_at
order_items: id, order_id, product_id, quantity, price
Inventory Service (inventory_db)
inventory: product_id, quantity, version
Notification Service (notification_db)
notifications: id, user_id, order_id, type, subject, message, status, sent_at, created_at
API Endpoints
Authentication
Method	Endpoint	Auth	Description
POST	/auth/register	None	Register new user
POST	/auth/login	None	Login, returns JWT
GET	/auth/users	ADMIN	List all users
Products
Method	Endpoint	Auth	Description
GET	/products	None	List products (paginated, cached)
GET	/products/{id}	None	Get product by ID
POST	/products	ADMIN	Create product
PUT	/products/{id}	ADMIN	Update product
DELETE	/products/{id}	ADMIN	Delete product
Orders
Method	Endpoint	Auth	Description
POST	/orders	USER	Create order (auto-uses X-User-Id from JWT)
GET	/orders	USER	List user's orders
GET	/orders/{id}	USER	Get order details
Inventory
Method	Endpoint	Auth	Description
POST	/inventory/reserve	Internal	Reserve stock (called by Order Service)
GET	/inventory/{productId}	Internal	Get stock level
Notifications
Method	Endpoint	Auth	Description
GET	/notifications	USER	Get user's notifications
GET	/notifications/{id}	USER	Get specific notification
🗄️ Database Schema
Auth Service (auth_db - Port 5432)
users: id, username, email, password, role, created_at
Product Service (product_db - Port 5433)
products: id, name, description, price, category, created_at, updated_at
Order Service (order_db - Port 5434)
orders: id, user_id, status (PENDING/CONFIRMED/SHIPPED/DELIVERED/CANCELLED), total_amount, created_at
order_items: id, order_id, product_id, product_name, quantity, price
Inventory Service (inventory_db - Port 5435)
inventory: product_id (PK), quantity, version, created_at, updated_at
Notification Service (notification_db - Port 5436)
notifications: id, user_id, order_id, type, subject, message,
status (PENDING/SENT/FAILED), sent_at, created_at
🛠️ Local Development Setup (Without Docker)
Prerequisites
Java 17+
Maven 3.8+
Node.js 18+
PostgreSQL 15
Redis 7+
Kafka 3.6+
Steps
Setup Databases

# Create 5 PostgreSQL databases
createdb auth_db
createdb product_db
createdb order_db
createdb inventory_db
createdb notification_db
Start Redis

redis-server --port 6379
Start Kafka & Zookeeper

# Using Kafka distribution
bin/zookeeper-server-start.sh config/zookeeper.properties
bin/kafka-server-start.sh config/server.properties
Start Backend Services (in separate terminals)

cd auth-service && mvn spring-boot:run
cd product-service && mvn spring-boot:run
cd inventory-service && mvn spring-boot:run
cd order-service && mvn spring-boot:run
cd notification-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run
Start Frontend

cd frontend
npm install
npm run dev
🧪 Testing
Manual Testing Flow
Register User

curl -X POST http://localhost:8080/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser","email":"test@example.com","password":"password123"}'
Login

curl -X POST http://localhost:8080/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"password123"}'
Copy the JWT token from response.

Create Product (as Admin) First login as admin, then:

curl -X POST http://localhost:8080/products \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <admin-token>" \
-d '{"name":"Laptop","description":"Gaming Laptop","price":1299.99,"category":"Electronics"}'
Place Order

curl -X POST http://localhost:8080/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <user-token>" \
-d '{"items":[{"productId":1,"quantity":2}]}'
Check Notifications

curl -X GET http://localhost:8080/notifications \
-H "Authorization: Bearer <user-token>"
Verify Kafka Events
# Check order-service logs
docker logs oms-order-service --tail 50 | grep "OrderCreatedEvent"

# Check notification-service logs
docker logs oms-notification-service --tail 50 | grep "Received OrderCreatedEvent"
Verify Inventory
# Connect to inventory database
docker exec -it oms-postgres-inventory psql -U postgres -d inventory_db

# Check stock levels
SELECT * FROM inventory;
🔒 Security Features
JWT Authentication with HS256 algorithm
Role-Based Access Control (USER, ADMIN)
Password Encryption using BCrypt
Optimistic Locking for concurrent inventory updates
API Gateway as single entry point
CORS configuration for frontend
📊 Monitoring & Debugging
Health Checks
curl http://localhost:8080/actuator/health
curl http://localhost:8081/actuator/health
curl http://localhost:8083/actuator/health
View Logs
# All services
docker-compose logs -f

# Specific service
docker logs oms-order-service -f
docker logs oms-notification-service -f
docker logs oms-kafka -f
Common Issues & Solutions
Issue: Kafka connection errors - "Connection to localhost:9092 failed"

Cause: Kafka advertising wrong address
Solution: Ensure KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092 in docker-compose.yml
Issue: Orders not creating notifications

Check 1: Verify Kafka consumer connected: docker logs oms-notification-service | grep "Discovered group coordinator"
Check 2: Verify event published: docker logs oms-order-service | grep "publishOrderCreated"
Check 3: Check for deserialization errors: docker logs oms-notification-service | grep "ERROR"
Issue: Frontend getting 401 Unauthorized

Cause: Token expired or navigation lost token
Solution: Use React Router <Link> components, not <a href>
📁 Project Structure
Order-Management-System/
├── api-gateway/                 # Spring Cloud Gateway
│   └── src/main/java/.../filter/JwtAuthenticationFilter.java
├── auth-service/                # Authentication microservice
│   └── src/main/java/.../util/JwtUtil.java (userId in claims)
├── product-service/             # Product management (Redis cache)
├── order-service/               # Order processing (Kafka producer)
│   └── src/main/java/.../kafka/OrderEventProducer.java
├── inventory-service/           # Stock management (Optimistic locking)
├── notification-service/        # Kafka consumer
│   └── src/main/java/.../kafka/OrderEventConsumer.java
├── frontend/                    # React + Material-UI + Vite
│   ├── public/
│   │   └── Asset/Images/        # Product images and branding
│   ├── vite.config.js          # Proxy configuration
│   └── src/
│       ├── theme.js             # Material-UI theme configuration
│       ├── components/          # Reusable MUI components
│       │   ├── AppLayout.jsx    # Main layout with sidebar
│       │   ├── ProductCard.jsx  # Product display card
│       │   ├── CartItem.jsx     # Cart item component
│       │   ├── OrderCard.jsx    # Order display card
│       │   ├── ConfirmDialog.jsx
│       │   └── LoadingSkeleton.jsx
│       ├── context/             # React Context API
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx # Dark mode management
│       │   └── NotificationContext.jsx # Toast notifications
│       ├── pages/               # Page components
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Products.jsx
│       │   ├── Cart.jsx
│       │   ├── Orders.jsx
│       │   └── AdminProducts.jsx
│       └── services/
│           └── api.js           # Axios instance with interceptors
├── docker-compose.yml           # Full stack orchestration
└── README.md
🎓 Learning Resources
This project demonstrates:

Microservices Architecture - Service decomposition, inter-service communication
Event-Driven Design - Kafka producers/consumers, eventual consistency
Spring Boot - REST APIs, JPA, Flyway migrations
Material-UI Design System - Modern React UI with theming
Responsive Design - Mobile-first approach with Material-UI breakpoints
State Management - React Context API for auth, theme, and notifications
User Experience - Loading states, error handling, confirmations
Frontend Architecture - Component composition, reusability, and separation of concerns
Spring Cloud Gateway - API Gateway pattern, JWT validation
React - SPA, React Router, Context API, Axios
Docker - Containerization, multi-container orchestration
PostgreSQL - Relational database per service
Redis - Caching layer
Apache Kafka - Asynchronous messaging
📝 Future Enhancements
Order status updates (CONFIRMED, SHIPPED, DELIVERED)
Admin dashboard for order management
Email/SMS notifications via Spring Mail/Twilio
Payment gateway integration
Elasticsearch for product search
Saga pattern for distributed transactions
Circuit breaker with Resilience4j
Distributed tracing with Sleuth/Zipkin
Kubernetes deployment | GET | /orders/{id} | Get order details (USER) |
Inventory
Method	Endpoint	Description
POST	/inventory/reserve	Reserve stock
GET	/inventory/{productId}	Get stock level
End-to-End Flow
User Registration/Login

POST /auth/register or /auth/login
Returns JWT token
Token must be included in Authorization: Bearer <token> header
Browse Products

GET /products?page=0&size=10
Products are cached in Redis
Place Order (Critical Flow)

POST /orders with items
Order Service calls Product Service to get prices (never trust client)
Order Service calls Inventory Service to reserve stock
Order is saved in a transaction
Kafka event OrderCreatedEvent is published
Notification

Notification Service consumes OrderCreatedEvent from Kafka
Notification is created and "sent" (simulated)
Setup Instructions
Prerequisites
Java 17+
Maven 3.8+
Node.js 18+
Docker & Docker Compose (for containerized setup)
Local Development Setup
Start Infrastructure

# Start PostgreSQL, Redis, Kafka via Docker
docker-compose up -d postgres-auth postgres-product postgres-order postgres-inventory postgres-notification redis kafka
Start Backend Services (in separate terminals)

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
Start Frontend

cd frontend
npm install
npm run dev
Docker Setup (Full Stack)
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
Environment Variables
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
Sample API Requests
Register User
curl -X POST http://localhost:8081/auth/register \
-H "Content-Type: application/json" \
-d '{"username":"testuser","email":"test@example.com","password":"password123"}'
Login
curl -X POST http://localhost:8081/auth/login \
-H "Content-Type: application/json" \
-d '{"username":"testuser","password":"password123"}'
Create Product (Admin)
curl -X POST http://localhost:8082/products \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{"name":"Test Product","description":"A test product","price":99.99,"category":"Electronics"}'
Place Order
curl -X POST http://localhost:8083/orders \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <token>" \
-d '{"items":[{"productId":1,"quantity":2}]}'
Project Structure
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
Testing
# Run unit tests for all services
cd <service> && mvn test

# Run integration tests
mvn verify -DskipITs=false
Security
JWT-based authentication
Role-based authorization (USER, ADMIN)
Password encryption with BCrypt
Optimistic locking for concurrent inventory updates
Monitoring
Actuator endpoints available at /actuator/health for each service
Correlation ID support via X-Correlation-ID header
👤 Author
Ritik Raj

GitHub: https://github.com/Ritikraj73
LinkedIn: https://www.linkedin.com/in/ritikraj73/
📄 License
This project is for educational purposes.

Note: For detailed implementation steps, see BUILD_STEPS.md. For system specifications, see SPEC.md.