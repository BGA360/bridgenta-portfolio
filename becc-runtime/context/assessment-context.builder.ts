import crypto from 'node:crypto';
import { AssessmentRequest } from '../shared/types.js';
import { ProjectConnectorResult } from '../connector/types.js';
import { AssessmentContext } from '../shared/types.js';
import {
  MissingInputException,
  InputCorrelationMismatch,
  InvalidClassificationException,
  InvalidLifecycleException,
  MalformedContextException,
  IntegrityFailureException
} from './exceptions.js';

// Deep cloning helper to isolate context from source mutations
function deepClone<T>(obj: T): T {
  if (obj === undefined) return undefined as any;
  return JSON.parse(JSON.stringify(obj));
}

// Deep freezing helper to enforce strict immutability
function deepFreeze<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
    }
  Object.freeze(obj);
  Object.keys(obj).forEach(key => {
    const prop = (obj as any)[key];
    if (prop !== null && typeof prop === 'object') {
      deepFreeze(prop);
  }
  });
  return obj;
}

// Recursive key-sorting helper for deterministic serialization
function sortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortKeys);
  }
  const sortedObj: any = {};
  Object.keys(obj).sort().forEach(key => {
    sortedObj[key] = sortKeys(obj[key]);
  });
  return sortedObj;
}

// RFC 4122 compliant UUID v5 generator using standard SHA-1 hash
function generateUuidV5(name: string): string {
  // Use DNS namespace UUID: 6ba7b810-9dad-11d1-80b4-00c04fd430c8
  const nsBytes = Buffer.from('6ba7b8109dad11d180b400c04fd430c8', 'hex');
  const nameBytes = Buffer.from(name, 'utf-8');
  const hash = crypto.createHash('sha1').update(Buffer.concat([nsBytes, nameBytes])).digest('hex');

  const part1 = hash.substring(0, 8);
  const part2 = hash.substring(8, 12);
  const part3 = '5' + hash.substring(13, 16); // Version 5
  // Variant 1 (RFC 4122) sets the two most significant bits of the 9th byte to 1 and 0 (0x80 to 0xbf)
  const varByte = (parseInt(hash.substring(16, 18), 16) & 0x3f | 0x80).toString(16).padStart(2, '0');
  const part4 = varByte + hash.substring(18, 20);
  const part5 = hash.substring(20, 32);

  return `${part1}-${part2}-${part3}-${part4}-${part5}`;
}

export class AssessmentContextBuilder {
  /**
   * Resolves the project lifecycle based on configuration overrides or Git branch names.
   */
  public static resolveLifecycle(
    branch: string,
    declaredLifecycle?: string
  ): 'Design' | 'Active' | 'Review' | 'Release' {
    if (declaredLifecycle) {
      const normalized = declaredLifecycle.trim().toLowerCase();
      if (normalized === 'design') return 'Design';
      if (normalized === 'active' || normalized === 'active development') return 'Active';
      if (normalized === 'review') return 'Review';
      if (normalized === 'release') return 'Release';
    }

    const branchName = branch.trim().toLowerCase();
    if (branchName === 'main' || branchName === 'master' || branchName.startsWith('release/')) {
      return 'Release';
    }
    if (branchName.startsWith('feature/') || branchName.startsWith('hotfix/')) {
      return 'Active';
    }
    if (branchName.startsWith('review/')) {
      return 'Review';
    }

    return 'Active';
  }

  /**
   * Normalizes and validates the security classification value.
   */
  public static resolveClassification(declaredClassification: string): 'public' | 'restricted' | 'private' | 'internal' {
    const normalized = declaredClassification.trim().toLowerCase();
    if (normalized === 'public' || normalized === 'restricted' || normalized === 'private' || normalized === 'internal') {
      return normalized;
    }
    throw new InvalidClassificationException(`Unsupported classification: "${declaredClassification}"`);
  }

  /**
   * Generates a deterministic HMAC-SHA256 signature using the assessmentId as the key.
   */
  public static generateTraceabilitySignature(assessmentId: string, contextFields: any): string {
    try {
      // Exclude contextId, traceabilityMetadata, and creationTimestamp to avoid cycles or non-deterministic fields
      const { contextId, traceabilityMetadata, creationTimestamp, ...rest } = contextFields;
      const sorted = sortKeys(rest);
      const serialized = JSON.stringify(sorted);
      return crypto.createHmac('sha256', assessmentId).update(serialized).digest('hex');
    } catch {
      throw new IntegrityFailureException();
    }
  }

  /**
   * Assembles, normalizes, validates, and freezes the canonical AssessmentContext.
   */
  public static build(
    request: AssessmentRequest,
    connectorResult: ProjectConnectorResult
  ): AssessmentContext {
    // 1. Assert required inputs are present
    if (!request || !connectorResult) {
      throw new MissingInputException();
    }

    // Clone inputs to ensure source isolation
    const reqCloned = deepClone(request);
    const resultCloned = deepClone(connectorResult);

    // 2. Perform correlation validation checks
    if (reqCloned.assessmentId !== resultCloned.assessmentId) {
      throw new InputCorrelationMismatch('Assessment ID mismatch between request and repository facts.');
    }
    if (reqCloned.project.trim().toLowerCase() !== resultCloned.project.trim().toLowerCase()) {
      throw new InputCorrelationMismatch('Project name mismatch between request and repository facts.');
    }
    if (reqCloned.target !== resultCloned.target) {
      throw new InputCorrelationMismatch('Target path mismatch between request and repository facts.');
    }
    if (reqCloned.timestamp !== resultCloned.timestamp) {
      throw new InputCorrelationMismatch('Timestamp mismatch between request and repository facts.');
    }
    if (reqCloned.providerPreference !== resultCloned.providerPreference) {
      throw new InputCorrelationMismatch('Provider preference mismatch between request and repository facts.');
    }

    // 3. Resolve lifecycle and classification
    const lifecyclePhase = this.resolveLifecycle(
      resultCloned.repositoryDetails.branch,
      resultCloned.rawConfig?.lifecycle
    );

    if (!resultCloned.declaredClassification) {
      throw new InvalidClassificationException('Target publication classification is missing.');
    }
    const publicationClassification = this.resolveClassification(resultCloned.declaredClassification);

    const creationTimestamp = new Date().toISOString();

    // 4. Assemble intermediate context fields
    const contextFields: Omit<AssessmentContext, 'contextId' | 'traceabilityMetadata'> = {
      assessmentId: reqCloned.assessmentId,
      project: reqCloned.project.trim(),
      target: reqCloned.target.trim(),
      projectIdentity: {
        name: resultCloned.projectIdentity.name,
        id: resultCloned.projectIdentity.id
      },
      repositoryDetails: {
        remoteUri: resultCloned.repositoryDetails.remoteUri,
        branch: resultCloned.repositoryDetails.branch,
        commitHash: resultCloned.repositoryDetails.commitHash,
        status: resultCloned.repositoryDetails.status
      },
      targetDocument: {
        path: resultCloned.targetDocument.path,
        hash: resultCloned.targetDocument.hash
      },
      projectType: resultCloned.projectType,
      lifecyclePhase,
      publicationClassification,
      providerPreference: reqCloned.providerPreference,
      runtimeMetadata: {
        env: resultCloned.runtimeMetadata.env,
        os: resultCloned.runtimeMetadata.os,
        timestamp: resultCloned.runtimeMetadata.timestamp,
        processId: resultCloned.runtimeMetadata.processId
      },
      creationTimestamp
    };

    // 5. Generate signature and deterministic Context ID
    const signature = this.generateTraceabilitySignature(reqCloned.assessmentId, contextFields);
    const contextId = generateUuidV5(signature);

    const context: AssessmentContext = {
      contextId,
      ...contextFields,
      traceabilityMetadata: {
        signature
      }
    };

    // 6. Basic structural validation
    if (
      !context.contextId ||
      !context.assessmentId ||
      !context.project ||
      !context.target ||
      !context.projectIdentity.name ||
      !context.projectIdentity.id ||
      !context.repositoryDetails.commitHash ||
      !context.targetDocument.hash ||
      !context.publicationClassification ||
      !context.lifecyclePhase
    ) {
      throw new MalformedContextException();
    }

    // 7. Enforce deep immutability
    return deepFreeze(context);
  }
}
