import test from 'node:test';
import assert from 'node:assert';
import {
  parseAndValidateAssessmentRequest,
  generateTimestamp,
  validateAssessmentId
} from '../shared/validation.js';

test('WP-002: Validation Helper - generateTimestamp', () => {
  const timestamp = generateTimestamp();
  assert.match(timestamp, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/);
  const parsed = Date.parse(timestamp);
  assert.ok(!isNaN(parsed));
});

test('WP-002: Validation Helper - validateAssessmentId', () => {
  assert.ok(validateAssessmentId('4f52e1fc-ef73-495f-b1d6-2d00c4721890')); // Valid UUID v4
  assert.ok(!validateAssessmentId('invalid-uuid'));
  assert.ok(!validateAssessmentId('4f52e1fc-ef73-395f-b1d6-2d00c4721890')); // Invalid version (v3)
});

test('WP-002: Request Parsing - Valid JSON payload', () => {
  const validJson = JSON.stringify({
    assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
    project: 'AEOcortex',
    target: 'docs/SPECIFICATION.md',
    timestamp: '2026-07-14T10:00:00Z',
    providerPreference: 'gemini'
  });

  const result = parseAndValidateAssessmentRequest(validJson);
  assert.ok(result.success);
  if (result.success) {
    assert.strictEqual(result.data.assessmentId, '4f52e1fc-ef73-495f-b1d6-2d00c4721890');
    assert.strictEqual(result.data.project, 'AEOcortex');
    assert.strictEqual(result.data.target, 'docs/SPECIFICATION.md');
    assert.strictEqual(result.data.timestamp, '2026-07-14T10:00:00Z');
    assert.strictEqual(result.data.providerPreference, 'gemini');
  }
});

test('WP-002: Request Parsing - Valid YAML payload (with providerPreference)', () => {
  const validYaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: StarCleaners
target: src/index.ts
timestamp: 2026-07-14T11:15:30.123Z
providerPreference: antigravity
`;

  const result = parseAndValidateAssessmentRequest(validYaml);
  assert.ok(result.success);
  if (result.success) {
    assert.strictEqual(result.data.project, 'StarCleaners');
    assert.strictEqual(result.data.target, 'src/index.ts');
    assert.strictEqual(result.data.timestamp, '2026-07-14T11:15:30.123Z');
    assert.strictEqual(result.data.providerPreference, 'antigravity');
  }
});

test('WP-002: Request Parsing - Valid YAML payload (without providerPreference)', () => {
  const yamlWithoutProvider = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: LuminaPraxis
target: README.md
timestamp: 2026-07-14T12:00:00Z
`;

  const result = parseAndValidateAssessmentRequest(yamlWithoutProvider);
  assert.ok(result.success);
  if (result.success) {
    assert.strictEqual(result.data.project, 'LuminaPraxis');
    assert.strictEqual(result.data.target, 'README.md');
    assert.strictEqual(result.data.providerPreference, undefined);
  }
});

test('WP-002: Request Parsing - Invalid syntax rejection', () => {
  const malformedYaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: [invalid
target: README.md
`;

  const result = parseAndValidateAssessmentRequest(malformedYaml);
  assert.ok(!result.success);
  if (!result.success) {
    assert.ok(result.errors.parse);
  }
});

test('WP-002: Request Parsing - Non-object payload rejection', () => {
  const result = parseAndValidateAssessmentRequest('string-payload');
  assert.ok(!result.success);
  if (!result.success) {
    assert.ok(result.errors.payload);
  }
});

test('WP-002: Field Validation - Invalid UUID v4 rejection', () => {
  const yaml = `
assessmentId: invalid-uuid-format
project: BridGenta
target: docs/spec.md
timestamp: 2026-07-14T10:00:00Z
`;

  const result = parseAndValidateAssessmentRequest(yaml);
  assert.ok(!result.success);
  if (!result.success) {
    assert.strictEqual(result.errors.assessmentId, 'Must be a valid UUID v4 string');
  }
});

test('WP-002: Field Validation - Missing fields rejection', () => {
  const yaml = `
project: BridGenta
`;

  const result = parseAndValidateAssessmentRequest(yaml);
  assert.ok(!result.success);
  if (!result.success) {
    assert.strictEqual(result.errors.assessmentId, 'Field is required');
    assert.strictEqual(result.errors.target, 'Field is required');
    assert.strictEqual(result.errors.timestamp, 'Field is required');
  }
});

test('WP-002: Field Validation - Empty project and target names rejection', () => {
  const yaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: "  "
target: ""
timestamp: 2026-07-14T10:00:00Z
`;

  const result = parseAndValidateAssessmentRequest(yaml);
  assert.ok(!result.success);
  if (!result.success) {
    assert.strictEqual(result.errors.project, 'Must not be empty');
    assert.strictEqual(result.errors.target, 'Must not be empty');
  }
});

test('WP-002: Field Validation - Path traversal escape attempt rejection', () => {
  const testCases = [
    '../secrets.json',
    'src/../../etc/passwd',
    'docs\\..\\admin.config',
    '..\\..\\root.txt'
  ];

  for (const traversalTarget of testCases) {
    const yaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: AEOcortex
target: "${traversalTarget.replace(/\\/g, '\\\\')}"
timestamp: 2026-07-14T10:00:00Z
`;
    const result = parseAndValidateAssessmentRequest(yaml);
    assert.ok(!result.success, `Traversal target "${traversalTarget}" should have been rejected`);
    if (!result.success) {
      assert.strictEqual(result.errors.target, 'Directory traversal sequence (..) is forbidden for security');
    }
  }
});

test('WP-002: Field Validation - Invalid timestamp format rejection', () => {
  const invalidTimecases = [
    '2026-07-14 10:00:00', // Missing 'T' and 'Z'
    '2026-07-14T10:00:00', // Missing 'Z'
    'invalid-date-string'
  ];

  for (const timeVal of invalidTimecases) {
    const yaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: BridGenta
target: docs/spec.md
timestamp: "${timeVal}"
`;
    const result = parseAndValidateAssessmentRequest(yaml);
    assert.ok(!result.success, `Timestamp value "${timeVal}" should have been rejected`);
    if (!result.success) {
      assert.strictEqual(result.errors.timestamp, 'Must be a valid ISO 8601 UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)');
    }
  }
});

test('WP-002: Field Validation - Invalid providerPreference rejection', () => {
  const yaml = `
assessmentId: 4f52e1fc-ef73-495f-b1d6-2d00c4721890
project: BridGenta
target: docs/spec.md
timestamp: 2026-07-14T10:00:00Z
providerPreference: ""
`;

  const result = parseAndValidateAssessmentRequest(yaml);
  assert.ok(!result.success);
  if (!result.success) {
    assert.strictEqual(result.errors.providerPreference, 'Must not be empty if provided');
  }
});
