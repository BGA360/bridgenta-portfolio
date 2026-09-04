import { RuleIdentity } from './provenance-types.js';

/**
 * Validates whether the RuleIdentity has complete cryptographic pinning
 * to prevent rule drift or missing implementation fallbacks during historical replay.
 */
export function isReplayReady(identity: RuleIdentity): boolean {
  return (
    typeof identity.ruleId === 'string' && identity.ruleId.length > 0 &&
    typeof identity.ruleDefinitionVersion === 'string' && identity.ruleDefinitionVersion.length > 0 &&
    typeof identity.ruleDefinitionHash === 'string' && identity.ruleDefinitionHash.length > 0 &&
    typeof identity.ruleImplementationVersion === 'string' && identity.ruleImplementationVersion.length > 0 &&
    typeof identity.ruleImplementationHash === 'string' && identity.ruleImplementationHash.length > 0
  );
}
