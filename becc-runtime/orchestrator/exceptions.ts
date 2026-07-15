export class OrchestrationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidStateTransitionException extends OrchestrationException {
  constructor(from: string, to: string) {
    super(`Invalid state transition from "${from}" to "${to}".`);
  }
}

export class DomainTimeoutException extends OrchestrationException {
  constructor(domain: string, limitMs: number) {
    super(`Domain "${domain}" execution exceeded timeout limit of ${limitMs}ms.`);
  }
}

export class SessionNotFoundException extends OrchestrationException {
  constructor(sessionId: string) {
    super(`Execution session "${sessionId}" was not found.`);
  }
}

export class OrchestratorAbortedException extends OrchestrationException {
  constructor(reason: string) {
    super(`Orchestrator execution was aborted: ${reason}`);
  }
}
