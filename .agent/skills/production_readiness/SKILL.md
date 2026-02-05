---
name: production_readiness
description: comprehensive checklist for ensuring a system is stable, secure, and ready for production traffic.
---

# Production Readiness Checklist
> **說明**：此 Skill 提供系統上線前的全方位檢查清單，確保安全性、效能與監控機制皆已就緒。

**Goal**: Ensure the system is reliable, secure, and observable before it goes live. Prevent "fire-fighting" mode after deployment.

## 1. When to use this skill
- Before launching a new feature or service.
- When performing a system audit.
- Before a major marketing event or expected traffic spike.
- **Trigger**: "We are going live tomorrow." -> STOP. Run this checklist.

## 2. The Checklist

### A. Reliability & Performance
- [ ] **Load Testing**: Has the system been tested under expected peak load? (e.g., using k6, JMeter)
- [ ] **Timeouts & Retries**: Are timeouts configured for all external calls? Are retries implementing exponential backoff?
- [ ] **Circuit Breakers**: Are circuit breakers in place for non-critical dependencies to prevent cascading failures?
- [ ] **Caching Strategy**: Is caching used effectively? Is there a strategy for cache invalidation?
- [ ] **Database Indexes**: Are queries optimized? Are necessary indexes created? Explain Plan checked?

### B. Monitoring & Observability
- [ ] **Logs**: Are logs structured (JSON)? Do they contain correlation IDs for tracing requests across services?
- [ ] **Metrics**: Are key business and system metrics defined? (e.g., Request Rate, Error Rate, Latency - RED method).
- [ ] **Alerts**: Are alerts set up for critical thresholds? Do they notify the right people? (Avoid alert fatigue).
- [ ] **Health Checks**: Does the service exhibit `/health` and `/ready` endpoints for load balancers?

### C. Security
- [ ] **Secrets Management**: Are secrets (API keys, passwords) removed from code and stored securely (e.g., Env vars, Vault, Secret Manager)?
- [ ] **Authentication/Authorization**: Is access control enforced correctly on all endpoints?
- [ ] **Data Encryption**: Is sensitive data encrypted at rest and in transit (HTTPS)?
- [ ] **Input Validation**: Are all inputs sanitized to prevent XSS and SQL Injection?

### D. Disaster Recovery & Operations
- [ ] **Backups**: Are database backups automated and **tested** for restoration?
- [ ] **Rollback Plan**: Is there a documented procedure to verify deployment and rollback immediately if it fails?
- [ ] **Documentation**: Are the README, API docs (Swagger/OpenAPI), and Runbooks up to date?
- [ ] **On-Call**: Is the on-call schedule defined? Does everyone have access to production logs/monitoring?

## 3. Post-Deployment Verification
- [ ] Verify smoke tests passed in production.
- [ ] Monitor error rates and latency for the first hour.
