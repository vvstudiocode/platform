---
name: clean_code_guard
# clean_code_guard
> **說明**：此 Skill 用於確保程式碼品質，包含命名規範、可讀性審查以及維護性原則。
description: Standards for code quality, readability, and maintainability.
---

# Clean Code Guard (Senior Engineer Reviewer)

**Goal**: Ensure code is readable, maintainable, and follows best practices. Code is read more often than it is written.

## 1. The Golden Rules
- **DRY (Don't Repeat Yourself)**: If you copy-paste code, refactor it into a function.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. The simplest solution is usually the best.
- **Single Responsibility**: A function should do ONE thing well.

## 2. Implementation Checklist

### Naming
- [ ] **Descriptive**: `calculateTotalPrice()` vs `calc()`
- [ ] **Consistent**: Use `camelCase` for JS/TS variables, `PascalCase` for Components/Classes.
- [ ] **No Magic Numbers**: Replace `if (status === 2)` with `if (status === STATUS.COMPLETED)`.

### Functions
- [ ] **Small**: ideally < 20-30 lines.
- [ ] **Pure (preferred)**: No side effects if possible (input -> output).
- [ ] **Early Return**:
    ```javascript
    // Good
    if (!user) return;
    doSomething();

    // Bad
    if (user) {
        doSomething();
    }
    ```

### Error Handling
- [ ] **Catch it**: Don't let the app crash. Wrap risky code in `try/catch`.
- [ ] **Report it**: Log the error (console.error) or show a user-friendly message.
- [ ] **No Silent Failures**: Never empty `catch (e) {}`.

## 3. Refactoring Trigger
If you see messy code while working on a file:
- **Boy Scout Rule**: Leave the code cleaner than you found it.
- Fix indentation, rename variables, extract functions *along the way* (but keep it safe).