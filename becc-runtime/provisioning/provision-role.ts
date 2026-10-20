/**
 * BECC v2 — Standalone Least-Privilege Database Role Provisioning Utility
 *
 * Implements deterministic, idempotent provisioning of the restricted application role
 * (default 'becc_app') using administrative/bootstrap credentials.
 * Enforces least-privilege access: SELECT & INSERT allowed on audit records, all mutations/DDL denied.
 */

import pkg from 'pg';
const { Client } = pkg;

export interface ProvisionRoleOptions {
  host: string;
  port: number;
  database: string;
  adminUser: string;
  adminPassword?: string;
  appRoleName?: string;
  appRolePassword?: string;
  ssl?: boolean;
}

export interface ProvisionRoleResult {
  success: boolean;
  roleName: string;
  database: string;
  occurredAt: string;
}

export async function provisionBeccAppRole(options: ProvisionRoleOptions): Promise<ProvisionRoleResult> {
  const roleName = options.appRoleName || 'becc_app';
  if (!/^[a-zA-Z0-9_]+$/.test(roleName)) {
    throw new Error(`Invalid role name '${roleName}'. Role name must contain only alphanumeric characters and underscores.`);
  }

  const client = new Client({
    host: options.host,
    port: options.port,
    database: options.database,
    user: options.adminUser,
    password: options.adminPassword,
    ssl: options.ssl
  });

  await client.connect();
  try {
    // 1. Idempotent role creation
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${roleName}') THEN
          CREATE ROLE ${roleName} WITH LOGIN;
        END IF;
      END
      $$;
    `);

    // 2. Safely set password if provided
    if (options.appRolePassword !== undefined) {
      const escapedPassword = options.appRolePassword.replace(/'/g, "''");
      await client.query(`ALTER ROLE ${roleName} WITH PASSWORD '${escapedPassword}';`);
    }

    // 3. Schema-level permissions
    await client.query(`
      CREATE SCHEMA IF NOT EXISTS becc;
      GRANT USAGE ON SCHEMA becc TO ${roleName};
      REVOKE CREATE ON SCHEMA becc FROM ${roleName};
    `);

    // 4. Grant least-privilege permissions on tables if they exist
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'becc_audit_records') THEN
          GRANT SELECT, INSERT ON TABLE becc.becc_audit_records TO ${roleName};
          REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE becc.becc_audit_records FROM ${roleName};
        END IF;
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'becc' AND table_name = 'schema_migrations') THEN
          GRANT SELECT ON TABLE becc.schema_migrations TO ${roleName};
          REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE becc.schema_migrations FROM ${roleName};
        END IF;
      END
      $$;
    `);

    // 5. Enforce restricted default privileges for future objects in becc schema
    await client.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA becc REVOKE ALL ON TABLES FROM ${roleName};
      ALTER DEFAULT PRIVILEGES IN SCHEMA becc GRANT SELECT, INSERT ON TABLES TO ${roleName};
      REVOKE CREATE ON SCHEMA public FROM ${roleName};
    `);

    return {
      success: true,
      roleName,
      database: options.database,
      occurredAt: new Date().toISOString()
    };
  } finally {
    await client.end().catch(() => {});
  }
}
