export type ScopeType = 'SECTION' | 'PAGE' | 'SITE' | 'COLLECTION';

export interface RepositoryIdentity {
  readonly remoteUri: string;
  readonly branch: string;
  readonly commitHash: string;
  readonly status: 'clean' | 'dirty';
}

export interface CommunicationTarget {
  readonly targetId: string;
  readonly displayName: string;
  readonly scopeType: ScopeType;
  readonly scopeTargets: readonly string[];
  readonly repositoryIdentity?: RepositoryIdentity;
  readonly profileIdentity: string;
  readonly governanceIdentity: string;
}
