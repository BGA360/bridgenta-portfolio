import { createHash } from 'crypto';
import type { GovernanceCommandEnvelope } from '../contracts/envelopes.js';
import {
  GovernanceCommandRecordSchema,
} from '../contracts/ports.js';
import type {
  GovernanceCommandRecord,
  IdempotencyStorePort,
  TransactionContext,
  RuntimeIntegrityUnitOfWork,
} from '../contracts/ports.js';
import type { RuntimeOperationResult } from './types.js';
import { RuntimeInvariantError } from './errors.js';

function deepClone<T>(val: T): T {
  if (val === undefined || val === null) {
    return val;
  }
  try {
    if (typeof structuredClone === 'function') {
      return structuredClone(val);
    }
  } catch {
    // Fallback if structuredClone fails
  }
  return JSON.parse(JSON.stringify(val));
}

/**
 * Deterministically canonicalizes input values for cryptographic hashing.
 * Rules:
 * - Object keys are recursively sorted alphabetically.
 * - Array element ordering is strictly preserved.
 * - Null and primitive types are preserved.
 * - Undefined object values are omitted.
 */
export function canonicalizeValue(val: unknown): unknown {
  if (val === null || val === undefined) {
    return null;
  }
  if (typeof val === 'number' || typeof val === 'boolean' || typeof val === 'string') {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(canonicalizeValue);
  }
  if (typeof val === 'object') {
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(val as Record<string, unknown>).sort();
    for (const key of keys) {
      const propVal = (val as Record<string, unknown>)[key];
      if (propVal !== undefined) {
        sortedObj[key] = canonicalizeValue(propVal);
      }
    }
    return sortedObj;
  }
  return String(val);
}

/**
 * Generates a canonical SHA-256 fingerprint for a GovernanceCommandEnvelope.
 * Binds: commandType, payloadVersion, canonicalized payload, actorRef, authorityContextRef.
 * Excludes: commandId (primary key lookup), issuedAt (immutable transport timestamp metadata).
 */
export function createCommandFingerprint(envelope: GovernanceCommandEnvelope): string {
  const canonicalPayload = canonicalizeValue(envelope.payload);
  const canonicalActorRef = canonicalizeValue(envelope.actorRef);
  const canonicalAuthorityContextRef = canonicalizeValue(envelope.authorityContextRef);

  const canonicalRepresentation = {
    actorRef: canonicalActorRef,
    authorityContextRef: canonicalAuthorityContextRef,
    commandType: envelope.commandType,
    payload: canonicalPayload,
    payloadVersion: envelope.payloadVersion,
  };

  const jsonString = JSON.stringify(canonicalRepresentation);
  return createHash('sha256').update(jsonString, 'utf8').digest('hex');
}

/**
 * Evaluates whether two command envelopes represent identical command execution metadata.
 */
export function compareCommandIdentityMetadata(
  existingEnvelope: GovernanceCommandEnvelope,
  newEnvelope: GovernanceCommandEnvelope
): { readonly matches: boolean; readonly mismatchReason?: string } {
  if (existingEnvelope.commandId !== newEnvelope.commandId) {
    return {
      matches: false,
      mismatchReason: `commandId mismatch: '${existingEnvelope.commandId}' vs '${newEnvelope.commandId}'`,
    };
  }
  if (existingEnvelope.commandType !== newEnvelope.commandType) {
    return {
      matches: false,
      mismatchReason: `commandType mismatch: '${existingEnvelope.commandType}' vs '${newEnvelope.commandType}'`,
    };
  }
  if (existingEnvelope.payloadVersion !== newEnvelope.payloadVersion) {
    return {
      matches: false,
      mismatchReason: `payloadVersion mismatch: '${existingEnvelope.payloadVersion}' vs '${newEnvelope.payloadVersion}'`,
    };
  }
  if (existingEnvelope.issuedAt !== newEnvelope.issuedAt) {
    return {
      matches: false,
      mismatchReason: `issuedAt immutable timestamp mismatch: '${existingEnvelope.issuedAt}' vs '${newEnvelope.issuedAt}'`,
    };
  }

  const fingerprintA = createCommandFingerprint(existingEnvelope);
  const fingerprintB = createCommandFingerprint(newEnvelope);
  if (fingerprintA !== fingerprintB) {
    return {
      matches: false,
      mismatchReason: `command fingerprint mismatch`,
    };
  }

  return { matches: true };
}

/**
 * Bounded transient in-memory idempotency adapter implementing IdempotencyStorePort.
 * Stores command execution records by commandId in memory.
 */
export class InMemoryIdempotencyStore implements IdempotencyStorePort {
  private readonly records: Map<string, GovernanceCommandRecord> = new Map();

  public getCommandExecution(
    commandId: string,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<GovernanceCommandRecord | undefined> {
    const record = this.records.get(commandId);
    return {
      ok: true,
      category: 'SUCCESS',
      data: record ? deepClone(record) : undefined,
    };
  }

  public recordCommandExecution(
    record: GovernanceCommandRecord,
    _transactionContext?: TransactionContext
  ): RuntimeOperationResult<{ readonly recorded: boolean; readonly record: GovernanceCommandRecord }> {
    const parseResult = GovernanceCommandRecordSchema.safeParse(record);
    if (!parseResult.success) {
      return {
        ok: false,
        category: 'ERROR',
        error: new RuntimeInvariantError(`Invalid command record schema: ${parseResult.error.message}`),
      };
    }

    const cloned = deepClone(parseResult.data);
    const existing = this.records.get(cloned.commandId);
    if (existing) {
      if (existing.commandFingerprint !== cloned.commandFingerprint) {
        return {
          ok: false,
          category: 'ERROR',
          error: new RuntimeInvariantError(
            `Duplicate execution record for commandId '${cloned.commandId}' with mismatched fingerprint`
          ),
        };
      }
      return {
        ok: true,
        category: 'SUCCESS',
        data: { recorded: false, record: deepClone(existing) },
      };
    }

    this.records.set(cloned.commandId, cloned);
    return {
      ok: true,
      category: 'SUCCESS',
      data: { recorded: true, record: deepClone(cloned) },
    };
  }

  public resetForTesting(): void {
    this.records.clear();
  }
}

/**
 * Bounded transient in-memory Unit-of-Work adapter (GL-HARDENING-001).
 * Level 1 in-process execution boundary.
 * 
 * Limitations:
 * - LEVEL 1 ONLY.
 * - Does NOT provide durable, crash-safe, or transactional database guarantees.
 */
export class InMemoryRuntimeIntegrityUnitOfWork implements RuntimeIntegrityUnitOfWork {
  public execute<T>(
    operation: (context: TransactionContext) => Promise<T> | T
  ): Promise<T> | T {
    const context: TransactionContext = {
      transactionId: `tx_mem_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      isDurable: false,
    };
    return operation(context);
  }
}
