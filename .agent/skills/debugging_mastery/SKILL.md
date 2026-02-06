---
name: debugging_mastery
description: Comprehensive guide and checklist for debugging common issues in the platform.
---

# Debugging Mastery

## Routing & Navigation (404 Errors)

### URL vs Directory Structure Mismatch
**Problem**: Links pointing to 404 pages (e.g., `/store/xxx/page/home` instead of `/store/xxx/home`).
**Check**:
1.  **Verify Directory Structure**: Look at `src/app/...` to confirm the actual route hierarchy.
    -   Example: `src/app/store/[slug]/[pageSlug]` means the URL is `/store/:slug/:pageSlug`.
2.  **Check URL Construction**: Search for the code generating the link (e.g., in `layout.tsx` or navigation components) and ensure it matches the directory structure exactly.
    -   Anti-pattern: Adding extra segments like `/page/` when the directory doesn't have a `page` folder.

## Build & Deployment

### Strict Build Checks
-   Always run `npm run build` locally before pushing.
-   Fix all TypeScript errors. "Any" is not a fix, it's a debt.
