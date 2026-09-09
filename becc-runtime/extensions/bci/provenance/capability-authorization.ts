/**
 * CONSTITUTIONAL INVARIANT:
 * 
 * ENVIRONMENT CAPABILITY
 * ≠
 * RUNTIME CAPABILITY
 * ≠
 * AUTHORIZATION
 * 
 * Technical capacity in the local operating system or tool availability (e.g. git/gh executable)
 * does NOT imply runtime feature completeness. Neither environment nor runtime capability
 * establishes operational authorization to execute mutating actions. Operational mutations
 * require explicit, single-use, non-inheritable authorization records.
 */

export type OperationIdentity =
  | 'AUDIT'
  | 'SEMANTIC_ANALYSIS'
  | 'REMEDIATION_PLAN'
  | 'EDIT'
  | 'BRANCH_CREATE'
  | 'COMMIT'
  | 'PUSH'
  | 'PR_CREATE'
  | 'MERGE'
  | 'DEPLOYMENT_INSPECT'
  | 'WORKFLOW_RERUN'
  | 'WORKFLOW_CANCEL'
  | 'ROLLBACK'
  | 'BRANCH_DELETE'
  | 'FINDING_CLOSE'
  | 'GOVERNANCE_AMEND';

export type AuthorizationState =
  | 'NOT_AUTHORIZED'
  | 'AUTHORIZED'
  | 'CONSUMED'
  | 'REFUSED'
  | 'EXPIRED';

export interface EnvironmentCapability {
  readonly operation: OperationIdentity;
  readonly isExecutableInEnvironment: boolean;
}

export interface RuntimeCapability {
  readonly operation: OperationIdentity;
  readonly isImplementedInRuntime: boolean;
}

export interface OperationAuthorization {
  readonly operation: OperationIdentity;
  readonly state: AuthorizationState;
  readonly sessionID: string;
  readonly authorizedAt?: string;
  readonly consumedAt?: string;
  readonly expiresAt?: string;
  readonly signatureToken?: string;
}
