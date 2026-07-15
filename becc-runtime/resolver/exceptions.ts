export class ResolverException extends Error {
  public readonly code: string;
  public readonly isRecoverable: boolean;

  constructor(message: string, code: string, isRecoverable = false) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.isRecoverable = isRecoverable;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MissingFolderException extends ResolverException {
  constructor(folderName: string) {
    super(`Target folder boundary "${folderName}" not found.`, 'MISSING_FOLDER', true);
  }
}

export class MissingEntryPointException extends ResolverException {
  constructor(entryPointName: string) {
    super(`Entry point manifest "${entryPointName}" not found.`, 'MISSING_ENTRY_POINT', false);
  }
}

export class MalformedMetadataException extends ResolverException {
  constructor(fileName: string, details: string) {
    super(`Malformed metadata frontmatter in "${fileName}": ${details}`, 'MALFORMED_METADATA', false);
  }
}

export class PathTraversalException extends ResolverException {
  constructor() {
    super('Prohibited directory boundary escape attempt detected.', 'PATH_TRAVERSAL_ESCAPE', false);
  }
}

export class BrokenTraceException extends ResolverException {
  constructor(ruleId: string) {
    super(`Traceability reference broken for rule "${ruleId}".`, 'BROKEN_TRACE', false);
  }
}

export class DuplicateRuleException extends ResolverException {
  constructor(ruleId: string) {
    super(`Duplicate rule identity detected for rule "${ruleId}".`, 'DUPLICATE_RULE_IDENTITY', false);
  }
}

export class UnsupportedVersionException extends ResolverException {
  constructor(version: string) {
    super(`Unsupported framework version: "${version}".`, 'UNSUPPORTED_VERSION', false);
  }
}

export class ConflictingOverridesException extends ResolverException {
  constructor(ruleId: string, sourceA: string, sourceB: string) {
    super(`Authority override conflict for rule "${ruleId}" between "${sourceA}" and "${sourceB}".`, 'CONFLICTING_PRECEDENCE_OVERRIDERS', false);
  }
}

export class MalformedVocabularyException extends ResolverException {
  constructor(details: string) {
    super(`Malformed vocabulary table: ${details}`, 'MALFORMED_VOCABULARY', false);
  }
}

export class ResolutionFailureException extends ResolverException {
  constructor(reason: string) {
    super(`Knowledge resolution process failed: ${reason}`, 'RESOLUTION_FAILURE', false);
  }
}
