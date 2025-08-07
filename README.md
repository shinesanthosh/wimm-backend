# WIMM - Where Is My Money? 💰

A production-ready personal expense tracking API built with Node.js, TypeScript, and MySQL. WIMM helps you understand where your money goes by providing a comprehensive expense tracking system with secure authentication, real-time monitoring, and detailed financial insights.

## ✨ Features

### 🔐 **Security & Authentication**

- User registration with username uniqueness validation
- JWT-based authentication with secure token management
- Token blacklist system for proper logout security
- Rate limiting to prevent abuse
- Security headers (Helmet.js) with CSP, HSTS, and more
- Input validation and sanitization with Zod schemas
- Password hashing with bcrypt and configurable salt rounds

### 📊 **Expense Management**

- Create, read, update, and delete expense entries
- Automatic expense categorization and summation
- Pagination support for large datasets
- Real-time balance calculations
- Date-based expense filtering

### 🛠️ **Developer Experience**

- Comprehensive OpenAPI/Swagger documentation
- Structured logging with Winston
- Type-safe API with TypeScript
- Comprehensive test suite with Jest
- Hot reload development environment

### 🚀 **Production Ready**

- Health check endpoints for monitoring
- Graceful shutdown handling
- Database connection pooling with retry logic
- Environment-based configuration
- Docker containerization support
- Performance optimized database queries

## 🏗️ **Architecture**

```
src/
├── auth/           # Authentication & authorization logic
├── config/         # Environment configuration management
├── db/             # Database connection and configuration
├── docs/           # API documentation (Swagger)
├── middleware/     # Express middleware (security, validation)
├── models/         # TypeScript interfaces and data models
├── routes/         # API route handlers
├── services/       # Business logic layer
├── types/          # TypeScript type definitions
├── utils/          # Utility functions (logging, errors)
└── validation/     # Input validation schemas
```

## 🚀 **Quick Start**

### Prerequisites

- Node.js 18+
- MySQL 8.0+
- Yarn package manager

### 1. Clone and Install

```bash
git clone https://github.com/your-username/wimm-backend.git
cd wimm-backend
yarn install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update with your configuration
nano .env.local
```

### 3. Database Setup

```bash
# Create database and run initial schema
mysql -u root -p < init.sql

# Apply performance indexes
mysql -u root -p wimm < migrations/001_add_indexes.sql
```

### 4. Start Development Server

```bash
yarn dev
```

The API will be available at `http://localhost:3010`

- **API Documentation**: `http://localhost:3010/api-docs`
- **Health Check**: `http://localhost:3010/health`

## 📋 **Environment Variables**

| Variable         | Description                               | Default       | Required |
| ---------------- | ----------------------------------------- | ------------- | -------- |
| `NODE_ENV`       | Environment (development/production/test) | `development` | ✅       |
| `PORT`           | Server port                               | `3010`        | ✅       |
| `DB_SERVER`      | MySQL host                                | `localhost`   | ✅       |
| `DB_USER`        | MySQL username                            | -             | ✅       |
| `DB_PASSWORD`    | MySQL password                            | -             | ✅       |
| `DB_NAME`        | Database name                             | `wimm`        | ✅       |
| `DB_PORT`        | MySQL port                                | `3306`        | ✅       |
| `JWT_SECRET`     | JWT signing secret (32+ chars)            | -             | ✅       |
| `JWT_EXPIRES_IN` | Token expiration time                     | `1h`          | ✅       |
| `SALT_ROUNDS`    | bcrypt salt rounds                        | `12`          | ✅       |
| `LOG_LEVEL`      | Logging level                             | `info`        | ❌       |

## 🔌 **API Endpoints**

### Authentication

- `POST /user/signup` - User registration
- `POST /user/login` - User login
- `GET /user/me` - Get current user info
- `POST /user/logout` - Logout and invalidate token

### Expense Management

- `GET /cash?page=1&limit=10` - Get paginated expenses
- `POST /cash` - Create new expense
- `GET /cash/:id` - Get specific expense
- `PUT /cash/:id` - Update expense
- `DELETE /cash/:id` - Delete expense

### System

- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /api-docs` - API documentation (dev only)

## 🧪 **Testing**

### Prerequisites

Before running tests, ensure you have:

1. MySQL server running locally
2. Test database set up

### Database Setup for Testing

```bash
# Setup test database (requires MySQL running)
./scripts/setup-test-db.sh

# Or manually:
mysql -u root -p < tests/setup-db.sql
```

### Running Tests

```bash
# Run all tests
yarn test

# Run tests in watch mode
yarn test:watch

# Generate coverage report
yarn test:coverage

# Run specific test file
yarn test tests/routes/user.test.ts
```

### Test Configuration

- Tests use a separate `wimm_test` database
- Rate limiting is configured for test environment
- Tests run sequentially to avoid conflicts
- Database connections are properly cleaned up

### Troubleshooting Tests

If tests fail with database errors:

1. Ensure MySQL is running: `brew services start mysql` (macOS) or `sudo service mysql start` (Linux)
2. Create test database: `mysql -u root -p -e "CREATE DATABASE wimm_test;"`
3. Run database setup: `./scripts/setup-test-db.sh`
4. Check database credentials in `.env.test`

## 🐳 **Docker Deployment**

### Build and Run

```bash
# Build the image
docker build -t wimm-backend .

# Run with environment variables
docker run -p 3010:3010 \
  -e DB_SERVER=your-db-host \
  -e DB_USER=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e JWT_SECRET=your-jwt-secret \
  wimm-backend
```

### Docker Compose (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📊 **Database Schema**

### Users Table (`user_data`)

```sql
CREATE TABLE user_data (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_name TEXT NOT NULL,
    password_hash CHAR(60) NOT NULL,
    INDEX idx_user_username (user_name(50))
);
```

### Expenses Table (`cashflow_data`)

```sql
CREATE TABLE cashflow_data (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NOT NULL,
    value DECIMAL(12, 2) NOT NULL,
    description TEXT,
    time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user_data(id) ON DELETE CASCADE,
    INDEX idx_cashflow_user_time (user_id, time DESC)
);
```

## 🔧 **Development**

### Project Structure

- **Routes**: Handle HTTP requests and responses
- **Services**: Business logic and data operations
- **Middleware**: Request processing (auth, validation, logging)
- **Utils**: Shared utilities (logging, errors, validation)

### Code Quality

- TypeScript for type safety
- ESLint and Prettier for code formatting
- Comprehensive error handling
- Structured logging with context
- Input validation on all endpoints

### Adding New Features

1. Define TypeScript interfaces in `/types`
2. Create Zod validation schemas in `/validation`
3. Implement business logic in `/services`
4. Add route handlers in `/routes`
5. Write tests in `/tests`
6. Update API documentation

## 📈 **Monitoring & Observability**

### Health Checks

- `GET /health` - Overall system health
- `GET /health/ready` - Kubernetes readiness probe

### Logging

- Structured JSON logging with Winston
- Request/response logging with performance metrics
- Error tracking with stack traces
- Log rotation and file management

### Metrics

- Request duration tracking
- Error rate monitoring
- Database connection health
- Authentication success/failure rates

## 🚀 **Production Deployment**

### Environment Setup

1. Set `NODE_ENV=production`
2. Use strong JWT secrets (32+ characters)
3. Configure proper database credentials
4. Set up log aggregation
5. Configure reverse proxy (nginx)

### Security Checklist

- ✅ Environment variables secured
- ✅ Database credentials encrypted
- ✅ JWT secrets rotated regularly
- ✅ Rate limiting configured
- ✅ Security headers enabled
- ✅ Input validation on all endpoints
- ✅ SQL injection protection
- ✅ XSS protection enabled

### Performance Optimization

- Database indexes on frequently queried columns
- Connection pooling with proper limits
- Request/response compression
- Caching strategies for static data
- Pagination for large datasets

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commit messages
- Ensure all tests pass

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 **Issues & Support**

- **Bug Reports**: [GitHub Issues](https://github.com/your-username/wimm-backend/issues)
- **Feature Requests**: [GitHub Issues](https://github.com/your-username/wimm-backend/issues)
- **Documentation**: [API Docs](http://localhost:3010/api-docs) (when running locally)

## 🙏 **Acknowledgments**

- Built with [Express.js](https://expressjs.com/)
- Authentication with [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- Validation with [Zod](https://zod.dev/)
- Logging with [Winston](https://github.com/winstonjs/winston)
- Documentation with [Swagger](https://swagger.io/)

---

**Made with ❤️ by [Shine Santhosh](https://github.com/your-username)**
