# Security Notes — ENOTES

## UI prototype
- Use mock data only.
- Do not put credentials, database connection strings, Supabase service-role keys, or other secrets in frontend code.
- Treat Vite environment variables exposed to browser code as public.
- Hiding a menu or disabling a button is not authorization.
- Clearly label mock login/save behavior; never claim a database save occurred.

## Future API
The browser must not connect directly to PostgreSQL through a pooler connection string. The .NET Core Web API should own database connectivity and enforce authentication, organization/tenant boundaries, and authorization for every protected operation. A client-provided organization ID is not proof of access. Validate inputs and business rules server-side. Detailed production security design is deferred until backend planning.
