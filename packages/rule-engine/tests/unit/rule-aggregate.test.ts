/**
 * @file rule-aggregate.test.ts
 * @module @cep/rule-engine
 * @type Unit Test
 */

import assert from 'node:assert/strict';
import { test, describe } from 'node:test';
import {
  Rule,
  RuleId,
  RuleCategory,
  RuleSeverity,
  RuleStatus,
  RuleExecutionError,
} from '../../src/index.js';

describe('Rule Aggregate — Unit Tests', () => {
  function createSampleRuleProps(id = 'rule-sample-01') {
    return {
      id: RuleId.create(id),
      metadata: {
        name: 'No Hardcoded Secrets',
        description: 'Verifies zero plain text passwords or tokens in code.',
        framework_id: 'CEF',
        category: RuleCategory.SECURITY,
        severity: RuleSeverity.CRITICAL,
        tags: ['security', 'secrets'],
      },
      traceability: {
        constitutional_source: 'docs/architecture/CEF-ARCHITECTURAL-ROLE.md',
        contract_id: 'CTR-003',
        domain_concept: 'Rule',
      },
      evaluator_fn: (payload: string) => {
        const hasSecret = /password|secret|api_key/i.test(payload);
        return {
          pass: !hasSecret,
          message: hasSecret ? 'Found potential hardcoded secret keyword.' : 'Clean payload.',
        };
      },
    };
  }

  test('should instantiate Rule aggregate root with ACTIVE status', () => {
    const rule = new Rule(createSampleRuleProps());

    assert.equal(rule.id, 'rule-sample-01');
    assert.equal(rule.status, RuleStatus.ACTIVE);
    assert.equal(rule.metadata.category, RuleCategory.SECURITY);
  });

  test('should evaluate clean payload successfully', () => {
    const rule = new Rule(createSampleRuleProps());
    const outcome = rule.evaluate('const port = 8080;');

    assert.equal(outcome.pass, true);
    assert.equal(outcome.message, 'Clean payload.');
  });

  test('should evaluate failing payload and return pass=false', () => {
    const rule = new Rule(createSampleRuleProps());
    const outcome = rule.evaluate('const secret = "12345";');

    assert.equal(outcome.pass, false);
    assert.equal(outcome.message, 'Found potential hardcoded secret keyword.');
  });

  test('should reject evaluation when rule status is INACTIVE', () => {
    const rule = new Rule(createSampleRuleProps());
    rule.setStatus(RuleStatus.INACTIVE);

    assert.throws(
      () => rule.evaluate('some text'),
      RuleExecutionError
    );
  });
});
