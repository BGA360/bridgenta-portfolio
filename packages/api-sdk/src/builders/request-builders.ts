/**
 * @file request-builders.ts
 * @module @cep/api-sdk
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-009 (Platform API & SDK Contract)
 * @domainConcept Fluent Request Builders
 */

import {
  AssessmentRequest,
  EvidenceSubmissionRequest,
  PipelineExecutionRequest,
} from '../domain/types.js';

export class PipelineRequestBuilder {
  private _requestId = `req-pipe-${Date.now()}`;
  private _projectRef = '';
  private _governanceLevel = 3;
  private _scopeManifest: string[] = [];
  private _submissions: EvidenceSubmissionRequest[] = [];
  private _rules: any[] = [];
  private _title?: string;
  private _issuer?: string;

  public setRequestId(id: string): this {
    this._requestId = id;
    return this;
  }

  public forProject(projectRef: string): this {
    this._projectRef = projectRef;
    return this;
  }

  public withGovernanceLevel(level: number): this {
    this._governanceLevel = level;
    return this;
  }

  public addScopeFile(path: string): this {
    this._scopeManifest.push(path);
    return this;
  }

  public addEvidence(submission: EvidenceSubmissionRequest): this {
    this._submissions.push(submission);
    return this;
  }

  public addRule(rule: any): this {
    this._rules.push(rule);
    return this;
  }

  public withCertificationDetails(title: string, issuer: string): this {
    this._title = title;
    this._issuer = issuer;
    return this;
  }

  public build(): PipelineExecutionRequest {
    return {
      request_id: this._requestId,
      project_ref: this._projectRef,
      target_governance_level: this._governanceLevel,
      scope_manifest: Object.freeze([...this._scopeManifest]),
      submissions: Object.freeze([...this._submissions]),
      rules: Object.freeze([...this._rules]),
      certification_title: this._title,
      certification_issuer: this._issuer,
    };
  }
}

export class AssessmentRequestBuilder {
  private _requestId = `req-ass-${Date.now()}`;
  private _projectRef = '';
  private _governanceLevel = 3;
  private _scopeManifest: string[] = [];

  public forProject(projectRef: string): this {
    this._projectRef = projectRef;
    return this;
  }

  public withGovernanceLevel(level: number): this {
    this._governanceLevel = level;
    return this;
  }

  public addScopeFile(path: string): this {
    this._scopeManifest.push(path);
    return this;
  }

  public build(): AssessmentRequest {
    return {
      request_id: this._requestId,
      project_ref: this._projectRef,
      target_governance_level: this._governanceLevel,
      scope_manifest: Object.freeze([...this._scopeManifest]),
    };
  }
}

export class EvidenceRequestBuilder {
  private _submissionId = `sub-${Date.now()}`;
  private _artifactName = '';
  private _rawPayload = '';
  private _contentChecksum = '';
  private _origin = '';

  public withArtifact(name: string, payload: string, checksum: string): this {
    this._artifactName = name;
    this._rawPayload = payload;
    this._contentChecksum = checksum;
    return this;
  }

  public withOrigin(origin: string): this {
    this._origin = origin;
    return this;
  }

  public build(): EvidenceSubmissionRequest {
    return {
      submission_id: this._submissionId,
      artifact_name: this._artifactName,
      raw_payload: this._rawPayload,
      content_checksum: this._contentChecksum,
      origin: this._origin,
    };
  }
}
