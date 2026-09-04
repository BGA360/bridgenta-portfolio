export interface AuditManifest {
  readonly auditId: string; // RUN-SCOPED run identifier
  readonly targetIdentity: string; // References target ID
  readonly scopeIdentity: string; // References target scope (e.g. url or relative paths)
  readonly inputContentHashes: Readonly<Record<string, string>>; // Maps page ID -> source file hash
  readonly knowledgeBundleIdentity: string; // Reference to governing KnowledgeBundle
  readonly governanceVersion: string;
  readonly runtimeVersion: string;
  readonly communicationProfileIdentity: string;
  readonly deterministicConfigurationHash: string;
  readonly semanticExecutionIdentity?: string; // Reference to SemanticExecutionIdentity, if applicable
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly domainManifest: readonly string[]; // Scoped audit domains (e.g. LANGUAGE, HEADINGS)
}
