import { ICandidateCommunicationBuilder } from './types.js';
import { CandidateCommunication } from '../shared/types.js';

export class CandidateCommunicationBuilderService implements ICandidateCommunicationBuilder {
  public build(
    sessionId: string,
    diffContent: string,
    targetFilePath: string
  ): CandidateCommunication {
    const communication: CandidateCommunication = {
      sessionId,
      diffContent,
      targetFilePath
    };

    return Object.freeze(communication);
  }
}
