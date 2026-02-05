---
name: security_first
description: Security best practices and audit checklist.
---

# Security First Guidelines
> **說明**：此 Skill 專注於安全性最佳實踐，防範常見漏洞（如 OWASP Top 10）與資料外洩風險。

**Goal**: Protect user data, prevent financial loss, and ensure system integrity. "Trust, but Verify."

## 1. Core Principles
- **Never Trust Frontend**: All data from the client (API inputs, form data) is potentially malicious.
- **Least Privilege**: Give the minimum required permission.

## 2. Security Checklist

### Input Validation (The First Line of Defense)
- [ ] **Validate Types**: Is `amount` actually a number? Is it positive?
- [ ] **Sanitize Strings**: Prevent XSS (Cross-Site Scripting) by escaping HTML characters if rendering user content.
- [ ] **Length Limits**: Prevent buffer overflows or DOS database attacks by limiting string length.

### Data Access & Auth
- [ ] **Authentication**: Is the user logged in?
- [ ] **Authorization**: Does THIS user own THIS resource?
    - *Bad*: `SELECT * FROM orders WHERE id = 1`
    - *Good*: `SELECT * FROM orders WHERE id = 1 AND user_id = current_user.id`

### Database & Logic
- [ ] **SQL Injection Prevention**: ALWAYS use parameterized queries / ORM methods. NEVER string concatenation.
- [ ] **Transaction Safety**: For financial ops (e.g., deduct credit), use Database Transactions (ACID).

### Sensitive Data
- [ ] **No Secrets in Code**: API Keys, Passwords MUST be in Environment Variables (`.env`), never in git.
- [ ] **No Logging PII**: Do not `console.log(userPassword)` or `console.log(creditCard)`.

## 3. Critical Review
Before marking a task as done, ask:
* "If I were a hacker, how would I abuse this function?"
* "Can I view someone else's order by changing the ID in the URL?"