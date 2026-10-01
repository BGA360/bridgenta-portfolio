/**
 * BECC v2 — Migration 001: Create BECC Audit Schema & Records Table
 *
 * Defines the initial PostgreSQL physical schema for BECC durable audit persistence.
 */

import crypto from 'node:crypto';

export interface MigrationDefinition {
  migrationId: string;
  sql: string;
  checksum: string;
}

const sql = `
CREATE SCHEMA IF NOT EXISTS becc;

CREATE TABLE IF NOT EXISTS becc.schema_migrations (
  migration_id VARCHAR(255) PRIMARY KEY,
  checksum VARCHAR(64) NOT NULL,
  applied_at VARCHAR(128) NOT NULL
);

CREATE TABLE IF NOT EXISTS becc.becc_audit_records (
  audit_record_id VARCHAR(255) PRIMARY KEY,
  operation_type VARCHAR(128) NOT NULL,
  operation_id VARCHAR(255) NOT NULL,
  project_ref VARCHAR(255),
  candidate_ref VARCHAR(255),
  workstream_ref VARCHAR(255),
  actor_ref VARCHAR(255),
  authority_context_ref VARCHAR(255),
  assessment_context_ref VARCHAR(255),
  correlation_ref VARCHAR(255),
  causation_ref VARCHAR(255),
  result_status VARCHAR(64) NOT NULL,
  domain_result_status VARCHAR(64),
  result_ref TEXT,
  occurred_at TEXT NOT NULL,
  occurred_at_instant TIMESTAMPTZ NOT NULL,
  external_authority_boundary VARCHAR(255),
  input_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance_refs JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_becc_audit_operation_id ON becc.becc_audit_records (operation_id);
CREATE INDEX IF NOT EXISTS idx_becc_audit_project_ref ON becc.becc_audit_records (project_ref);
CREATE INDEX IF NOT EXISTS idx_becc_audit_correlation_ref ON becc.becc_audit_records (correlation_ref);
CREATE INDEX IF NOT EXISTS idx_becc_audit_causation_ref ON becc.becc_audit_records (causation_ref);
CREATE INDEX IF NOT EXISTS idx_becc_audit_occurred_at ON becc.becc_audit_records (occurred_at_instant ASC, audit_record_id ASC);
`.trim();

const checksum = crypto.createHash('sha256').update(sql).digest('hex');

export const migration001: MigrationDefinition = {
  migrationId: '001_create_becc_audit_records',
  sql,
  checksum
};
