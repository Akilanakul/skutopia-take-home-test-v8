# Improvements

**Author:** Akhila AJ  
**Role:** Senior Software Product Engineer  
**Time taken:** 8 hours

## Technical Improvements

### 1. Maintainability - Environment-Based Configuration

**Problem:** Configuration scattered across codebase makes environment-specific deployments difficult and business rule changes require code updates.

**Solution:** Centralized config with environment files:

```typescript
// src/config/index.ts
import { z } from 'zod';

const configSchema = z.object({
    PORT: z.coerce.number().default(8044),
    DATABASE_URL: z.string().default('postgresql://localhost:5432/skutopia'),
    UPS_BASE_RATE: z.coerce.number().default(800),
    UPS_PER_GRAM_RATE: z.coerce.number().default(0.05),
    MAX_ITEM_WEIGHT: z.coerce.number().default(50000)
});

export const config = configSchema.parse(process.env);

// .env.production vs .env.development
UPS_BASE_RATE=850  # Production rates
UPS_BASE_RATE=800  # Development rates
```

**Benefits:** Environment-specific deployments, business rules configurable without code changes, type-safe validation.

**Tradeoffs:** Additional setup complexity, but essential for production systems with multiple environments.

### 2. Testability - Eliminate Duplicate Types in Tests

**Problem:** Tests redefine types like SalesOrder that duplicates existing OrderInput schema, causing maintenance burden and potential type drift.

**Solution:** Import and reuse existing types from server code:

```typescript
// ❌ BAD: api-tests/util.ts
export type SalesOrder = { id: string; customer: string; items: {...}[] };

// ✅ GOOD: api-tests/util.ts  
import { OrderInput, CarrierCode } from "../server/src/domain/entities";
const ORDERS = loadFixture<{ salesOrders: OrderInput[] }>("sales-orders.json");
```

**Benefits:** Single source of truth, compile-time type safety, automatic schema change propagation to tests.

**Tradeoffs:** Slightly tighter coupling between tests and server code, but this is beneficial since tests should break when API contracts change.

### 3. Test Database Isolation with Docker

**Problem:** Tests currently use the same in-memory repository as the application, causing **test interference and data dependency issues**. Tests fail when run in different orders because they share state and don't clean up properly.

**Solution:** Use Docker containerized database for tests with proper isolation.

**Benefits:** Eliminates test interdependencies, realistic database behavior, tests can run in any order, supports parallel execution.

**Tradeoffs:** Slower test execution, requires Docker in CI/CD, but eliminates flaky tests caused by shared state.

### 4. Security Improvement - Bearer Token Authentication

**Problem:** Current system has no authentication, allowing unauthorized access to order data and carrier fee calculations.

**Solution:** Implement JWT-based authentication middleware.

**Benefits:** Prevents unauthorized access, enables user-specific data filtering, supports role-based permissions.

**Tradeoffs:** Added complexity for token management and refresh, but essential for production security.

### 5. Monitoring and Observability - Structured Logging and Error Handling

**Problem:** Current logging lacks structure and context, making production debugging difficult when issues occur across multiple requests. Generic error responses don't provide actionable information for developers or users.

**Solution:** Implement structured logging with correlation IDs and comprehensive error handling with custom error types for better debugging and user experience.

**Benefits:** Easier debugging with correlation IDs, actionable error messages, business intelligence from structured logs, and improved production observability.

## Product Considerations

### 1. Real-Time Order Tracking and Customer Notifications

**Questions for Product Manager:**
- What level of order visibility do customers expect, and how do we handle carrier integration for tracking?
- What happens after an order is booked? Do we need tracking, delivery confirmation, returns processing?
- Should customers receive notifications (email, SMS, push) for order status changes?
- How do we handle failed deliveries, damaged packages, or customer complaints?

**Product Impact:** Post-booking experience determines customer satisfaction and retention. Affects technical architecture for external integrations and notification systems.

### 2. System Integration Requirements

**Questions for Product Manager:**
- What existing systems (ERP, CRM, e-commerce platforms) need to integrate with us?

### 3. International Shipping Capabilities

**Questions for Product Manager:**
- Are we planning to support international shipping?
- How do we handle customs, duties, and international carrier relationships?

**Product Impact:** International support significantly increases complexity but opens larger market opportunities.

### 4. Multi-Tenant Architecture

**Questions for Product Manager:**
- Should customers only see their own orders, or do we need organization-level access?
- Do we need role-based access control (admin, customer service, regular users)?

**Product Impact:** Determines entire user experience, security model, and revenue strategy. Affects database design and authentication architecture.

## Product Feature Recommendation: Smart Shipping Optimizer

### Feature Description
An AI-powered shipping recommendation engine that analyzes historical shipping data, delivery performance, and costs to automatically suggest the optimal carrier for each order.

### Business Value
- **Customer Satisfaction:** Improved delivery times and reliability through data-driven recommendations
- **Cost Optimization:** Automatic selection of most cost-effective options based on historical performance
- **Competitive Advantage:** Unique AI-driven feature differentiating from basic shipping calculators
- **Revenue Growth:** Better service quality leads to customer retention and premium pricing opportunities