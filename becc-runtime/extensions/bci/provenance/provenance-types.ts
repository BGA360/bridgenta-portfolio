/**
 * Identifies the exact rule schema definition and historical runner implementation.
 */
export interface RuleIdentity {
  readonly ruleId: string;
  readonly ruleDefinitionVersion: string;
  readonly ruleDefinitionHash: string;
  readonly ruleImplementationVersion: string;
  readonly ruleImplementationHash: string;
}

/**
 * Capture state of the BECC execution context.
 */
export interface RuntimeIdentity {
  readonly runtimeVersion: string;
  readonly runtimeHash: string;
  readonly moduleVersions: Readonly<Record<string, string>>;
  readonly deterministicConfigurationHash: string;
}

/**
 * Capture state of the communication profile targets.
 */
export interface ProfileIdentity {
  readonly profileId: string;
  readonly profileVersion: string;
  readonly profileHash: string;
}

/**
 * Captures AI provider settings if semantic validation runs.
 */
export interface SemanticExecutionIdentity {
  readonly provider: string;
  readonly model: string;
  readonly modelVersion?: string;
  readonly configurationHash: string;
  readonly promptTemplateHash: string;
  readonly temperature?: number;
}

/**
 * Mapped location of the content in repository, build output, or web DOM.
 */
export interface SourceLocation {
  readonly filePath?: string;
  readonly startLine?: number;
  readonly endLine?: number;
  readonly startColumn?: number;
  readonly endColumn?: number;
  readonly domSelector?: string;
  readonly domPath?: string;
  readonly url?: string;
}

export type AuditDomainState =
  | 'PASS'
  | 'FINDINGS'
  | 'NOT_APPLICABLE'
  | 'AUDIT_INCOMPLETE';

export type AuditDomainIdentity =
  | 'LANGUAGE'
  | 'HEADINGS'
  | 'TERMINOLOGY'
  | 'NARRATIVE'
  | 'AUDIENCE'
  | 'CLAIMS'
  | 'EVIDENCE'
  | 'OUTCOMES'
  | 'LIFECYCLE'
  | 'PUBLIC_PRIVATE'
  | 'INFORMATION_ARCHITECTURE'
  | 'ARTIFACTS'
  | 'ACCESSIBILITY_COMMUNICATION'
  | 'CROSS_SECTION'
  | 'CROSS_PAGE'
  | 'CROSS_PROJECT';

export interface AuditDomainResult {
  readonly domain: AuditDomainIdentity;
  readonly state: AuditDomainState;
  readonly justification?: string; // Mandatory if state === 'NOT_APPLICABLE'
}


