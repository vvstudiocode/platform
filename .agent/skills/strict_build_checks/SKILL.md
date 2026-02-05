---
name: strict_build_checks
description: Mandatory strict build and type verification process to prevent compile-time errors.
---

# Strict Build & Type Safety (Gatekeeper)

> **Core Philosophy**: "If it doesn't build, it doesn't ship." Never assume a code change is safe until `npm run build` passes locally.

## 1. The Golden Rule
Before finishing ANY task that involves code changes:
-   **MUST RUN**: `npm run build` (or strict type check command).
-   **Verification**: Ensure exit code is `0`.
-   **No Bypass**: Do not ignore "minor" TypeScript errors. They will break the CI/CD pipeline.

## 2. Common Pitfalls & Fixes

### A. Server Actions & `useActionState`
**Problem**: Type mismatch between `useActionState`'s initial state and the Server Action's return type.
**Solution**:
1.  **Shared Type**: Define a `State` type in `actions.ts` and export it.
2.  **Explicit Return**: The action must return `Promise<State>`.
3.  **Typed Initial State**: The component must type `initialState: State`.

```typescript
// actions.ts
export type State = { error?: string, success?: string }
export async function update(prev: any, formData: FormData): Promise<State> { ... }

// Component.tsx
import { State } from './actions'
const initialState: State = { ... }
const [state, action] = useActionState(update, initialState)
```

### B. Recursive Functions & Inference
**Problem**: TypeScript often fails to infer the correct union type for accumulators in recursive functions (e.g., `reduce`).
**Solution**: Explicitly type the accumulator variable.

```typescript
// BAD
const flattened = [{ ...item }] // Inferred as specific shape, might reject slightly different shape from recursive call

// GOOD
const flattened: NavItem[] = [{ ...item }] // Explicit type allows polymorphism compliant with interface
```

### C. Component Props Compliance
**Problem**: Passing data that "looks like" the prop but misses required fields (e.g., `position` in `NavItem`).
**Solution**:
1.  **Check Interface**: Read the component's interface definition.
2.  **Explicit Mapping**: When mapping data from DB to Props, verify EVERY required field is present.
    ```typescript
    navItems.map(item => ({
        ...item,
        position: item.position || 0, // Handle missing optional fields if they are required in Prop
    }))
    ```

### D. API Robustness
**Problem**: Using variables in the response that were never defined or extracted from the request body.
**Solution**:
1.  **Destructuring Safety**: Destructure all needed variables at the top.
2.  **Scope Check**: Ensure response variables (e.g., `total`) exist in the current scope.

```typescript
const { total: bodyTotal } = body
// ... calculation ...
const finalTotal = bodyTotal || calculatedTotal
return NextResponse.json({ total: finalTotal }) // Don't use 'total' if it was renamed
```

## 3. When to Apply
-   **Always** when touching `.ts` / `.tsx` files.
-   **Especially** when modifying Data Fetching, Server Actions, or shared UI Components.
