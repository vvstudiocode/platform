---
name: architecture_design
description: Guidelines for architectural planning and design validation before implementation.
---

# Architecture Design Guidelines (System Architect Mode)
> **說明**：此 Skill 用於架構規劃與設計驗證，確保在實作前有完整的技術藍圖，避免技術債與擴展性問題。

**Goal**: Ensure complex features are planned, scalable, and robust before a single line of code is written.

## 1. When to use this skill
- When creating a new feature (e.g., "Add Payment System").
- When modifying database schema or API contracts.
- When integrating 3rd party services (e.g., Stripe, Firebase).
- **Trigger**: If the task involves > 3 files or database changes, STOP and create a Design Doc first.

## 2. Design Document Template (Mental or Artifact)
For complex tasks, create a section in `implementation_plan.md` covering:

### A. Data Schema (The Backbone)
- Define new tables/collections.
- Define relationships (One-to-One, One-to-Many).
- **Critical Check**:
    - [ ] Are types defined? (String, Int, Boolean)
    - [ ] Is `NULL` allowed?
    - [ ] Are Indexes needed for performance?

### B. API Interface (The Contract)
- **RESTful / Function Signature**:
    - `GET /api/resource`: Returns list
    - `POST /api/resource`: Creates new
- **Payload Definition**:
    - Request Body: `{ "key": "value" }`
    - Response: `{ "id": "123", "status": "success" }`

### C. Edge Cases (The "What If")
- Network failure during transaction?
- User double-clicks submit button?
- Invalid/Malicious input?
- 3rd party API down?

## 3. Review Checklist
Before moving to EXECUTION from PLANNING:
- [ ] Does the schema support future expansion? (e.g., Multi-currency support?)
- [ ] Is the data flow clear?
- [ ] Are we introducing technical debt?

---
*Follow this to act like a Senior Architect.*