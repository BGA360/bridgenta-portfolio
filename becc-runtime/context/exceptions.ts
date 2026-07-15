export class ContextError extends Error {
  public readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    // Mask paths, credentials, and raw stack details in public messages
    this.message = message
      .replace(/[A-Za-z]:\\[^:\n]+/g, '<path>')
      .replace(/\/[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+/g, '<path>');
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class MissingInputException extends ContextError {
  constructor(message = 'Missing request or repository facts.') {
    super(message, 'MissingInput');
  }
}

export class InputCorrelationMismatch extends ContextError {
  constructor(message = 'Input correlation mismatch.') {
    super(message, 'InputCorrelationMismatch');
  }
}

export class InvalidClassificationException extends ContextError {
  constructor(message = 'Target publication classification is invalid.') {
    super(message, 'InvalidClassification');
  }
}

export class InvalidLifecycleException extends ContextError {
  constructor(message = 'Resolved lifecycle phase is invalid.') {
    super(message, 'InvalidLifecycle');
  }
}

export class MalformedContextException extends ContextError {
  constructor(message = 'Compiled context is structurally malformed.') {
    super(message, 'MalformedContext');
  }
}

export class IntegrityFailureException extends ContextError {
  constructor(message = 'Integrity signature generation failed.') {
    super(message, 'IntegrityFailure');
  }
}
