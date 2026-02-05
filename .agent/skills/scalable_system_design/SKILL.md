---
name: scalable_system_design
description: Guidelines for designing systems that can handle growth, high traffic, and large datasets.
---

# Scalable System Design Guidelines
> **說明**：此 Skill 重點在於高流量系統的設計原則，包含水平擴展、快取策略與資料庫優化技術。

**Goal**: Design systems that can scale horizontally and handle failure gracefully.

## 1. When to use this skill
- When designing high-traffic applications.
- When the database is becoming a bottleneck.
- When planning for 10x or 100x user growth.
- When evaluating architectural decisions during the design phase.

## 2. Core Principles

### A. Scalability Primitives
- **Horizontal Scaling (Scale Out)**: Add more machines, not stronger machines. Design applications to be **stateless** so any server can handle any request.
- **Load Balancing**: Distribute traffic across multiple servers (e.g., Nginx, AWS ALB). Use health checks to remove unhealthy nodes.
- **Caching**: "The fastest request is the one you don't make."
    - **CDN**: Cache static assets (images, CSS, JS) at the edge.
    - **Application Cache**: Use Redis/Memcached for expensive query results or session data.
- **Asynchrony**: Use Message Queues (RabbitMQ, Kafka, SQS) to decouple heavy processing from the user-facing request flow (e.g., sending emails, generating reports).

### B. Database Patterns
- **Replica Sets**: Use Master-Slave replication. Write to Master, Read from Slaves to scale read throughput.
- **Sharding**: Partition data across multiple databases (e.g., by User ID). *Complexity warning: do this only when necessary.*
- **Denormalization**: Duplicate data to avoid complex joins in high-read scenarios.

### C. Resilience Patterns
- **Graceful Degradation**: If a recommendation service fails, show the user a generic "Popular Item" list instead of crashing effectively.
- **Rate Limiting**: Protect your API from being overwhelmed by a single user or bot.
- **Idempotency**: Ensure that retrying a failed operation (like a payment) doesn't cause a double-charge.

## 3. Design Checklist
- [ ] **Statelessness**: Can I kill any server instance without losing user data? (Sessions should be in Redis/DB).
- [ ] **Bottlenecks**: Where is the single point of failure? (SPOF). How do we eliminate it?
- [ ] **Data Growth**: What happens when the database table hits 10 million rows? (Indexing, Archiving, Partitioning).
- [ ] **CAP Theorem**: In a network partition, do we choose Consistency or Availability? (Know your trade-off).
