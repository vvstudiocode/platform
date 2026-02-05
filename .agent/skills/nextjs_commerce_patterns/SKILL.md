---
name: Next.js Commerce Patterns
description: Best practices and architectural patterns derived from Vercel's Next.js Commerce, tailored for building high-performance e-commerce storefronts.
---

# Next.js Commerce Patterns & Best Practices

This skill captures the architectural decisions and optimizations found in high-performance Next.js e-commerce applications (like the Vercel Commerce starter).

## 1. Architecture & Data Flow

### Composable Architecture
-   **Service Layer Pattern**: Abstract the "Commerce Provider" (e.g., Shopify, BigCommerce, or your custom DB) behind a unified service layer.
    -   *Why*: Allows switching backends or mixing data sources without rewriting UI components.
    -   *Implementation*: Create a `lib/commerce` folder with standardized types (`Product`, `Cart`, `Checkout`) and fetchers.

### Data Fetching (RSC & Suspense)
-   **Streaming**: Use `<Suspense>` boundaries around distinct sections (e.g., `<ProductGrid>`, `<RelatedProducts>`) to allow the critical path (Product Details) to load immediately while secondary content streams in.
-   **Parallel Data Fetching**: Don't `await` sequentially if data isn't dependent.
    ```tsx
    // Bad
    const product = await getProduct(slug);
    const related = await getRelated(product.id);

    // Good (if possible) - or use Suspense for the second part
    const [product, related] = await Promise.all([getProduct(slug), getRelated(product.id)])
    // OR better: Fetch product, render main UI, put Related in a Suspense component that fetches its own data.
    ```

## 2. Component Patterns

### Product Cards
-   **Image Optimization**: Use `next/image` with `sizes` prop strictly defined to avoid downloading desktop-sized images on mobile.
-   **Layout Stability**: Always reserve space (aspect-ratio) for images to prevent CLS (Cumulative Layout Shift).

### Cart & Checkout
-   **Optimistic UI**: When a user clicks "Add to Cart", immediately update the UI count/sidebar state *before* the server confirms it. Rollback on error.
    -   *Tool*: `useOptimistic` hook in React 18+.
-   **Cookie-based Cart ID**: Store the `cartId` in HTTP-only cookies to persist sessions across reloads and devices (if logged in).

## 3. Performance & SEO

### Edge Caching
-   **Stale-While-Revalidate**: Aggressively cache product pages (`revalidate: 60` or higher). Use `revalidateTag` (On-Demand Revalidation) via Webhooks when product data changes in the admin panel to update instantly.
    -   *Tagging*: `fetch(url, { next: { tags: ['products'] } })`

### Metadata
-   **Dynamic Metadata**: Generate `title`, `description`, `openGraph`, and `jsonLd` (Structured Data) dynamically for every product page.
    ```tsx
    export async function generateMetadata({ params }): Promise<Metadata> {
      const product = await getProduct(params.slug)
      return {
        title: product.title,
        openGraph: { images: [product.featuredImage] }
      }
    }
    ```

## 4. UI/UX Specifics
-   **Fast Navigation**: Use Next.js `<Link>` with `prefetch={true}` (default) to ensure instant page transitions.
-   **Search**: Implement search as a URL-state driven feature (`/search?q=shoes`). This makes search results shareable and indexable.
