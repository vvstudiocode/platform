---
name: Supabase & Database Architect
description: Guidelines for secure, scalable PostgreSQL database design and Supabase integration.
---

# Supabase & Database Architecture Guidelines

## Database Design Rules (PostgreSQL)
1.  **Naming Conventions**:
    -   Tables and Columns: `snake_case` (e.g., `product_categories`, `is_published`).
    -   Primary Keys: `id` (UUID v4 preferred for distributed systems/security).
    -   Foreign Keys: `singular_table_name_id` (e.g., `user_id`, `store_id`).
2.  **Normalization**: Ensure database is normalized to at least 3NF. Avoid duplication. Use JSONB only for truly dynamic schema-less data (e.g., `settings`, `metadata`), not for relation-heavy data.
3.  **Indexing**: Always index Foreign Keys and columns frequently used in `WHERE`, `ORDER BY`, or `JOIN` clauses.

## Security (Row Level Security - RLS)
-   **Enable RLS**: ALWAYS enable RLS on every table created. `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`.
-   **Least Privilege**: Start with `DENY ALL` and whitelist specific actions.
-   **Helper Functions**: Use PostgreSQL functions (`auth.uid()`) to verify ownership.
-   **Service Role Caution**: Avoid using the `service_role` key in Client Components. It bypasses RLS and should only be used in trusted Server Contexts (e.g., Server Actions, Webhooks) when absolutely necessary.

## Supabase Client Usage
-   **Server Components**: Use `createClient` from `@/lib/supabase/server` (cookies-based).
-   **Client Components**: Use `createClient` from `@/lib/supabase/client`.
-   **Middleware**: Ensure `updateSession` is called in middleware to refresh auth tokens.

## Type Safety
-   **Database Types**: Always generate and use the `Database` type definition from the Supabase CLI.
-   **Query Typing**:
    ```typescript
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .returns<User[]>() // Enforce return type if automatic inference falls short
    ```

## Performance
-   **Select Specific Columns**: Avoid `.select('*')` in production. Select only what you need: `.select('id, name, avatar_url')`.
-   **Pagination**: Use `.range(start, end)` for large datasets.
-   **Relations**: Use Supabase's automatic joining (e.g., `.select('*, posts(*)')`) judiciously to prevent N+1 visual performance issues, although Supabase handles it efficiently, deep nesting can be slow. 
