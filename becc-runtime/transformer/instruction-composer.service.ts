import { IInstructionComposer, IKnowledgeBundle } from './types.js';
import { AssessmentContext } from '../shared/types.js';

export class InstructionComposerService implements IInstructionComposer {
  public composeSystemInstructions(bundle: IKnowledgeBundle): string {
    const canons = bundle.rules.filter(r => r.type === 'Canon');
    const guidelines = bundle.rules.filter(r => r.type === 'Guideline');

    let instructions = 'You are an expert software engineer checking compliance against BridGenta Portfolio Rules.\n';
    instructions += 'Apply the following rules strictly in order of precedence:\n\n';

    if (canons.length > 0) {
      instructions += '### CANONICAL RULES (Mandatory):\n';
      for (const rule of canons) {
        instructions += `- [${rule.id}]: ${rule.summary}\n  Body: ${rule.body}\n`;
      }
      instructions += '\n';
    }

    if (guidelines.length > 0) {
      instructions += '### GUIDELINE RULES:\n';
      for (const rule of guidelines) {
        instructions += `- [${rule.id}]: ${rule.summary}\n  Body: ${rule.body}\n`;
      }
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
