export class MissingResolvedKnowledgeException extends Error {
  constructor() {
    super('Input resolved knowledge data is missing.');
    this.name = 'MissingResolvedKnowledgeException';
  }
}

export class EmptyBundleException extends Error {
  constructor() {
    super('No rules are selected for compilation.');
    this.name = 'EmptyBundleException';
  }
}

export class InvalidLineRangeException extends Error {
  constructor(ruleId: string, details: string) {
    super(`Invalid line range for rule ${ruleId}: ${details}`);
    this.name = 'InvalidLineRangeException';
  }
}

export class StalePointerException extends Error {
  constructor(ruleId: string, details: string) {
    super(`Stale pointer verification failed for rule ${ruleId}: ${details}`);
    this.name = 'StalePointerException';
  }
}

export class DuplicateRuleException extends Error {
  constructor(ruleId: string) {
    super(`Duplicate rule identifier in bundle: ${ruleId}`);
    this.name = 'DuplicateRuleException';
  }
}

export class MalformedVocabularyException extends Error {
  constructor(term: string, details: string) {
    super(`Vocabulary entry malformed for term '${term}': ${details}`);
    this.name = 'MalformedVocabularyException';
  }
}

export class ConflictingVocabularyException extends Error {
  constructor(term: string, details: string) {
    super(`Conflicting vocabulary definition for term '${term}': ${details}`);
    this.name = 'ConflictingVocabularyException';
  }
}

export class MalformedEvidenceException extends Error {
  constructor(ruleId: string, details: string) {
    super(`Malformed evidence mapping for rule ${ruleId}: ${details}`);
    this.name = 'MalformedEvidenceException';
  }
}

export class OversizedBundleException extends Error {
  constructor(size: number, limit: number) {
    super(`Bundle size limit exceeded. Current size: ${size} bytes, Limit: ${limit} bytes`);
    this.name = 'OversizedBundleException';
  }
}
