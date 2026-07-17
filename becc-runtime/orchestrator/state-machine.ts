import { OrchestratorState } from './types.js';
import { InvalidStateTransitionException } from './exceptions.js';

export class RuntimeStateMachine {
  private currentState: OrchestratorState = 'Pending';

  public getState(): OrchestratorState {
    return this.currentState;
  }

  public transitionTo(nextState: OrchestratorState): void {
    if (this.currentState === nextState) return;

    if (!this.isValidTransition(this.currentState, nextState)) {
      throw new InvalidStateTransitionException(this.currentState, nextState);
    }

    this.currentState = nextState;
  }

  private isValidTransition(from: OrchestratorState, to: OrchestratorState): boolean {
    switch (from) {
      case 'Pending':
        return to === 'Initializing';
      case 'Initializing':
        return to === 'Running' || to === 'Failed';
      case 'Running':
        return to === 'Waiting' || to === 'Failed' || to === 'Cancelled';
      case 'Waiting':
        return to === 'Completed' || to === 'Failed' || to === 'Cancelled' || to === 'RevisionRequested';
      case 'RevisionRequested':
        return to === 'Pending' || to === 'Failed' || to === 'Cancelled';
      case 'Completed':
      case 'Failed':
      case 'Cancelled':
        return false;
      default:
        return false;
    }
  }
}
