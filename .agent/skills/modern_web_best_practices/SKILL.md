---
name: modern_web_best_practices
description: Standards for code quality, architectural layering, and modern web development workflows.
---

# Modern Web Development Best Practices
> **說明**：此 Skill 涵蓋現代 Web 開發的最佳實踐，包括前後端分離、API 設計規範及 12-Factor App 原則。

**Goal**: Write maintainable, clean, and collaborative web application code.

## 1. When to use this skill
- When setting up a new project structure.
- When refactoring spaghetti code.
- During code reviews to enforce standards.

## 2. The 12-Factor App methodology (Cloud Native)
1.  **Codebase**: One codebase tracked in revision control, many deploys.
2.  **Dependencies**: Explicitly declare and isolate dependencies (e.g., `package.json`, Docker).
3.  **Config**: Store config in the environment, not in the code.
4.  **Backing Services**: Treat backing services (DB, Cache) as attached resources.
5.  **Build, Release, Run**: Strictly separate build and run stages.
6.  **Processes**: Execute the app as one or more stateless processes.
7.  **Port Binding**: Export services via port binding.
8.  **Concurrency**: Scale out via the process model.
9.  **Disposability**: Maximize robustness with fast startup and graceful shutdown.
10. **Dev/Prod Parity**: Keep development, staging, and production as similar as possible.
11. **Logs**: Treat logs as event streams (stdout/stderr).
12. **Admin Processes**: Run admin/management tasks as one-off processes.

## 3. Layered Architecture (Backend)
Separate concerns to keep code testable and organized:
- **Presentation Layer (Controllers)**: Handles HTTP requests, validation, and serialization. *No business logic here.*
- **Business Layer (Services)**: Contains the core business logic and rules.
- **Data Access Layer (Repositories/DAO)**: Interaction with the database. *No business logic here.*
- **Utilities/Shared**: Common helpers, constants, and types.

## 4. API Design Standards (RESTful)
- **Nouns, not Verbs**: Use `/users` not `/getUsers`.
- **HTTP Methods**: Use GET, POST, PUT, DELETE, PATCH correctly.
- **Status Codes**:
    - `200 OK`, `201 Created`
    - `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`
    - `500 Internal Server Error`
- **Filtering/Pagination**: Use query params: `/products?limit=25&offset=50&category=shoes`.

## 5. Frontend Best Practices
- **Component Design**: Small, focused components (Atomic Design).
- **State Management**: Local state for UI, Global state (Context/Redux) for data shared across pages.
- **Performance**:
    - Lazy loading routes and heavy components.
    - Optimized images (WebP) and sizing.
    - Minimize main thread blocking.
