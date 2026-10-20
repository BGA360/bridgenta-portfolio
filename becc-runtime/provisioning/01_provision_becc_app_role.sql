-- BECC v2 — Standalone Least-Privilege Database Role Provisioning Script
-- Closes NEXT006-GAP-004
-- Target Role: becc_app
-- Grants: CONNECT, USAGE on schema becc, SELECT/INSERT on becc.becc_audit_records, SELECT on becc.schema_migrations
-- Denies: UPDATE, DELETE, TRUNCATE, DDL, CREATE on schema, SUPERUSER

-- 1. Create role if not exists (Idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'becc_app') THEN
    CREATE ROLE becc_app WITH LOGIN;
  END IF;
END
$$;

-- 2. Ensure becc schema exists
CREATE SCHEMA IF NOT EXISTS becc;

-- 3. Schema-level permissions
GRANT USAGE ON SCHEMA becc TO becc_app;
REVOKE CREATE ON SCHEMA becc FROM becc_app;

-- 4. Audit table permissions (SELECT and INSERT allowed; UPDATE, DELETE, TRUNCATE denied)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'becc_audit_records') THEN
    GRANT SELECT, INSERT ON TABLE becc.becc_audit_records TO becc_app;
    REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE becc.becc_audit_records FROM becc_app;
  END IF;
END
$$;

-- 5. Schema migrations table permissions (SELECT allowed for checksum verification; INSERT/UPDATE/DELETE denied)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'schema_migrations') THEN
    GRANT SELECT ON TABLE becc.schema_migrations TO becc_app;
    REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE becc.schema_migrations FROM becc_app;
  END IF;
END
$$;

-- 6. Ensure default privileges for future objects in becc schema are restricted
ALTER DEFAULT PRIVILEGES IN SCHEMA becc REVOKE ALL ON TABLES FROM becc_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA becc GRANT SELECT, INSERT ON TABLES TO becc_app;

-- 7. Cross-schema restriction (public schema)
REVOKE CREATE ON SCHEMA public FROM becc_app;
