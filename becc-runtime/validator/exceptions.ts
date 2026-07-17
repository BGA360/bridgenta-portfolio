export class ValidationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class StaleBaselineException extends ValidationException {
  constructor(message = 'Target baseline hash has changed since transformation.') {
    super(message);
  }
}

export class MalformedDiffException extends ValidationException {
  constructor(message = 'Diff structure is malformed or invalid.') {
    super(message);
  }
}

export class UnsupportedRuleException extends ValidationException {
  constructor(message = 'Validation rule type is unsupported or unrecognized.') {
    super(message);
  }
}

export class PathTraversalException extends ValidationException {
  constructor(message = 'Target file path traverses outside repository containment.') {
    super(message);
  }
}
