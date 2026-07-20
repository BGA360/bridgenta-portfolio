/**
 * @file normalizer.ts
 * @module @cep/repository-gateway
 * @constitutionalSource docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md
 * @contract CTR-007 (Repository Gateway Contract)
 * @domainConcept Repository Normalizer & Evidence Transformer
 */

import { EvidenceSubmissionModel, EvidenceCategory, EvidenceType } from '@cep/evidence-manager';
import {
  Repository,
  Branch,
  Commit,
  File,
  RepositoryMetadata,
  RepositorySnapshot,
  Timestamp,
} from '../domain/types.js';

export class RepositoryNormalizer {
  /**
   * Assembles a canonical RepositorySnapshot from provider adapter outputs.
   */
  public static normalizeSnapshot(
    repository: Repository,
    branch: Branch,
    commit: Commit,
    fileTree: readonly File[],
    metadata: RepositoryMetadata
  ): RepositorySnapshot {
    return {
      repository: Object.freeze({ ...repository }),
      branch: Object.freeze({ ...branch }),
      commit: Object.freeze({ ...commit }),
      file_tree: Object.freeze([...fileTree]),
      metadata: Object.freeze({ ...metadata }),
      captured_at: Timestamp.create(),
    };
  }

  /**
   * Transforms a RepositorySnapshot into canonical EvidenceSubmissionModel payloads suitable for Evidence Manager ingestion.
   */
  public static transformSnapshotToEvidenceSubmissions(
    snapshot: RepositorySnapshot,
    assessmentId: string,
    correlationId: string
  ): EvidenceSubmissionModel[] {
    const submissions: EvidenceSubmissionModel[] = [];

    for (const file of snapshot.file_tree) {
      const sub: EvidenceSubmissionModel = {
        submission_id: `sub-${snapshot.repository.name}-${file.artifact_name}-${Date.now()}`,
        assessment_id: assessmentId,
        artifact_name: file.artifact_name,
        category: EvidenceCategory.STATIC_CODE,
        type: EvidenceType.FILE_ARTIFACT,
        raw_payload: file.raw_content,
        content_checksum: file.checksum,
        origin: `${snapshot.repository.uri}/${file.path}`,
        submitting_authority: 'repository-gateway',
        correlation_id: correlationId,
        constitutional_source: 'docs/architecture/CEP-CONSTITUTIONAL-ARCHITECTURE.md',
        tags: [snapshot.repository.provider_type.toLowerCase(), 'repository-evidence'],
      };
      submissions.push(sub);
    }

    return submissions;
  }
}
