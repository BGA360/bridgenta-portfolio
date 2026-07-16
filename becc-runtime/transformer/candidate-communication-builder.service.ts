import { ICandidateCommunicationBuilder } from './types.js';
import { CandidateCommunication } from '../shared/types.js';

export class CandidateCommunicationBuilderService implements ICandidateCommunicationBuilder {
  public build(
    sessionId: string,
    diffContent: string,
    targetFilePath: string
  ): CandidateCommunication {
    const status = diffContent.length > 0 ? 'success' : 'failed';

    const communication: CandidateCommunication = {
      sessionId,
      diffContent,
      targetFilePath,
      status
    };

    return Object.freeze(communication);
  }
}
