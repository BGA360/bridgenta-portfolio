import { ValidationErrorDetails, ValidationResult } from '../../../shared/types.js';
import { RuleIdentity, AuditDomainResult } from './provenance-types.js';
import { CommunicationProfile } from '../model/communication-profile.js';

export function validateString(val: unknown, minLength = 1): boolean {
  return typeof val === 'string' && val.trim().length >= minLength;
}

export function validateArray(val: unknown, validateItem: (item: unknown) => boolean): boolean {
  return Array.isArray(val) && val.every(validateItem);
}

export function validateRuleIdentity(raw: unknown): ValidationResult<RuleIdentity> {
  const errors: ValidationErrorDetails = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, errors: { payload: 'RuleIdentity must be an object' } };
  }
  const r = raw as any;
  if (!validateString(r.ruleId)) errors.ruleId = 'Required string';
  if (!validateString(r.ruleDefinitionVersion)) errors.ruleDefinitionVersion = 'Required string';
  if (!validateString(r.ruleDefinitionHash)) errors.ruleDefinitionHash = 'Required string';
  if (!validateString(r.ruleImplementationVersion)) errors.ruleImplementationVersion = 'Required string';
  if (!validateString(r.ruleImplementationHash)) errors.ruleImplementationHash = 'Required string';

  return Object.keys(errors).length === 0
    ? { success: true, data: r as RuleIdentity }
    : { success: false, errors };
}

export function validateCommunicationProfile(raw: unknown): ValidationResult<CommunicationProfile> {
  const errors: ValidationErrorDetails = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, errors: { payload: 'Profile must be an object' } };
  }
  const p = raw as any;
  if (!validateString(p.profileId)) errors.profileId = 'Required string';
  if (!validateString(p.profileVersion)) errors.profileVersion = 'Required string';
  if (!validateString(p.profileHash)) errors.profileHash = 'Required string';
  if (!validateString(p.displayName)) errors.displayName = 'Required string';
  if (!validateString(p.targetLanguage)) errors.targetLanguage = 'Required string';
  if (!validateString(p.targetAudience)) errors.targetAudience = 'Required string';
  if (!validateString(p.registerTarget)) errors.registerTarget = 'Required string';
  if (p.extendsProfile !== undefined && !validateString(p.extendsProfile)) {
    errors.extendsProfile = 'Must be string if provided';
  }

  return Object.keys(errors).length === 0
    ? { success: true, data: p as CommunicationProfile }
    : { success: false, errors };
}

export function validateAuditDomainResult(raw: unknown): ValidationResult<AuditDomainResult> {
  const errors: ValidationErrorDetails = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { success: false, errors: { payload: 'AuditDomainResult must be an object' } };
  }
  const ad = raw as any;

  const validDomains: string[] = [
    'LANGUAGE', 'HEADINGS', 'TERMINOLOGY', 'NARRATIVE', 'AUDIENCE', 'CLAIMS',
    'EVIDENCE', 'OUTCOMES', 'LIFECYCLE', 'PUBLIC_PRIVATE', 'INFORMATION_ARCHITECTURE',
    'ARTIFACTS', 'ACCESSIBILITY_COMMUNICATION', 'CROSS_SECTION', 'CROSS_PAGE', 'CROSS_PROJECT'
  ];

  const validStates: string[] = ['PASS', 'FINDINGS', 'NOT_APPLICABLE', 'AUDIT_INCOMPLETE'];

  if (!validateString(ad.domain) || !validDomains.includes(ad.domain)) {
    errors.domain = `Must be one of: ${validDomains.join(', ')}`;
  }
  if (!validateString(ad.state) || !validStates.includes(ad.state)) {
    errors.state = `Must be one of: ${validStates.join(', ')}`;
  }

  if (ad.state === 'NOT_APPLICABLE') {
    if (!validateString(ad.justification)) {
      errors.justification = 'Justification is required when state is NOT_APPLICABLE';
    }
  }

  return Object.keys(errors).length === 0
    ? { success: true, data: ad as AuditDomainResult }
    : { success: false, errors };
}

