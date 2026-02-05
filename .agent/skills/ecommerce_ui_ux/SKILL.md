---
name: Modern E-commerce UI/UX
description: Design principles and code standards for creating premium, conversion-oriented e-commerce interfaces.
---

# Modern E-commerce UI/UX Guidelines

## Design Aesthetics & Philosophy
-   **Premium Feel**: Use generous whitespace (padding/margin), subtle shadows (`shadow-sm`, `shadow-md`), and refined typography (Inter, system-ui).
-   **Modern Palette**: Avoid pure black (`#000`). Use Zinc/Slate grays (`text-zinc-900`, `bg-zinc-50`) for a softer, high-end look.
-   **Visual Hierarchy**: Use font weight and color contrast to guide the user's eye (e.g., Price > Title > Description).

## Responsive Design (Mobile-First)
-   **Mobile-First Coding**: Write default classes for mobile, then override for larger screens.
    -   *Bad*: `grid-cols-3 sm:grid-cols-1`
    -   *Good*: `grid-cols-1 md:grid-cols-3`
-   **Touch Targets**: Ensure all interactive elements (buttons, inputs) are at least 44px tall on mobile.
-   **Thumb Zone**: Put primary actions (e.g., "Add to Cart", "Filter") within easy reach of the thumb at the bottom of the screen on mobile.

## Components & Interactivity
-   **Feedback States**:
    -   **Hover**: All clickable elements must have a hover state (`hover:bg-zinc-100`).
    -   **Active/Focus**: Inputs must have clear focus rings for accessibility.
    -   **Loading**: Use Skeleton loaders instead of spinners for content areas to reduce perceived latency.
-   **Transitions**: Add smooth transitions to state changes.
    -   Standard: `transition-all duration-200 ease-in-out`
-   **Images**:
    -   Always use `aspect-ratio` to prevent layout shift (CLS).
    -   Use `object-cover` for product cards.
    -   Implement "Group Hover" zoom effects for product images (`group-hover:scale-105`).

## Tailwind CSS Best Practices
-   **Consistency**: Use the theme's color tokens (`bg-primary`, `text-secondary`) rather than arbitrary hex values, unless creating specific style overrides.
-   **Grid Layouts**: Use CSS Grid for product lists (2-col mobile, 3/4-col desktop) for strict alignment.
-   **Container Queries**: If supported/needed, use container queries for components that might appear in various sized slots (e.g., sidebar vs main content).

## Accessibility (A11y)
-   **Semantic HTML**: Use `<button>`, `<a>`, `<input>` appropriately. Avoid `div { cursor: pointer }`.
-   **Alt Text**: All product images require meaningful `alt` text.
-   **Contrast**: Ensure text color meets WCAG AA contrast ratios against backgrounds. 
