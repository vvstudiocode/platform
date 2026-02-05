---
name: Next.js App Router Expert
description: Expert guidelines for building scalable, high-performance applications with Next.js 13+ App Directory.
---

# Next.js App Router Implementation Guidelines

## Core Principles
1.  **Server Components by Default**: Always prefer Server Components (RSC) for data fetching and rendering HTML. Only add `'use client'` when interactivity (state, effects, event listeners) is strictly required.
2.  **Server Actions for Mutations**: Use Server Actions for all data mutations (API calls, DB updates) instead of client-side API routes (`pages/api`).
3.  **URL as Source of Truth**: Manage state in the URL (searchParams, dynamic segments) whenever possible to ensure shareability and proper history management.

## Data Fetching & Caching
-   **Fetch in Components**: Fetch data directly in the Server Component where it is needed. Next.js automatically dedupes requests.
-   **Caching Strategy**: explicitly define cache behavior via `fetch(url, { next: { revalidate: 3600 } })` or `export const revalidate = 3600` for route segments.
-   **Revalidation**: Use `revalidatePath` in Server Actions after a mutation to refresh data immediately without a full page reload.

## Folder Structure & Routing
-   **Colocation**: Keep related components, styles, and tests inside the route segment folder.
-   **Private Folders**: Use `_folderName` to opt-out of routing for implementation details.
-   **Route Groups**: Use `(groupName)` to organize routes without affecting the URL structure (e.g., `(dashboard)`, `(auth)`).

## Server Actions Pattern
```tsx
// actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createItem(formData: FormData) {
  try {
    // 1. Validate & Parse Data
    const data = parse(formData)
    
    // 2. Perform DB Operation
    await db.create(data)
    
  } catch (e) {
    return { error: 'Failed to create item' }
  }

  // 3. Revalidate & Redirect
  revalidatePath('/items')
  redirect('/items')
}
```

## Form Handling (`useActionState`)
-   Use `useActionState` (formerly `useFormState`) for robust form handling with Server Actions, supporting loading states and error feedback.
-   Combine with `useFormStatus` to disable submit buttons during pending states.

## Error Handling
-   Use `error.tsx` file in route segments to gracefully handle runtime errors.
-   Use `not-found.tsx` for 404 scenarios.
-   Wrap Server Actions in `try/catch` and return plain objects `{ error: string }` instead of throwing errors to the client to avoid crashing the hydration. 

## Common Pitfalls & Debugging (Hydration & Revalidation)
1.  **`removeChild` Error**: This is almost always a hydration mismatch caused by invalid HTML nesting.
    -   **Rule**: NEVER nest block elements (`div`, `p`, `h1`...) inside `<p>` tags. Browsers auto-correct this by closing the `<p>`, confusing React. Use `<div>` for text containers instead.
    -   **Stability**: Avoid unmounting/remounting elements (like conditionally rendering SVG icons) inside buttons during loading states. Use CSS visibility or keep the DOM structure constant (e.g., `opacity-0` instead of `null`).
2.  **State Conflicts with `revalidatePath`**:
    -   **Rule**: Do NOT `revalidatePath` the *current* page being edited if it has complex client-side state (like a form or editor). This causes the server to send a fresh HTML tree that conflicts with the client's current interactive state, leading to errors. Only revalidate parent lists or public-facing pages.
