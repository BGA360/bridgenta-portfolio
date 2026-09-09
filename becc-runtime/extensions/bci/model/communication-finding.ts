import { ValidationFinding } from '../../../shared/types.js';

export interface CommunicationFinding extends ValidationFinding {
  readonly auditId: string;
  readonly domain: string; // Mapped audit domain, e.g. 'LANGUAGE', 'HEADINGS'
  readonly targetNodeIds: readonly string[]; // IDs of graph entities involved
  readonly ruleDefinitionIdentity: string;
  readonly ruleImplementationIdentity: string;
  readonly profileIdentity?: string;
  readonly findingState: 'OPEN' | 'RESOLVED' | 'WAIVED';
}
