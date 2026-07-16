import { IInstructionComposer, IKnowledgeBundle } from './types.js';
import { AssessmentContext } from '../shared/types.js';

export class InstructionComposerService implements IInstructionComposer {
  public composeSystemInstructions(bundle: IKnowledgeBundle): string {
    let instructions = 'You are an expert software engineer checking compliance against BridGenta Portfolio Rules.\n';
    instructions += 'Apply the following rules strictly in the order presented:\n\n';

    for (const rule of bundle.rules) {
      instructions += `- [${rule.id}] (${rule.type}): ${rule.summary}\n  Body: ${rule.body}\n`;
    }

    return instructions.trim();
  }

  public composePromptText(context: AssessmentContext, fileContent: string): string {
    return `Generate a unified diff for the following target file to make it comply with the rules:
Path: ${context.targetDocument.path}
Session ID: ${context.assessmentId}

Target File Content:
<target_file>
${fileContent}
</target_file>

Output ONLY the unified diff formatted inside a markdown block. No conversational preamble.`;
  }
}
