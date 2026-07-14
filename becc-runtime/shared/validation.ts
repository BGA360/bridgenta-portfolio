import YAML from 'yaml';
import { AssessmentRequest, ValidationResult, ValidationErrorDetails } from './types.js';

// Regex to strictly match UUID v4 format
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Regex to match ISO 8601 UTC format (e.g., 2026-07-14T10:00:00.000Z or 2026-07-14T10:00:00Z)
const ISO_8601_UTC_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

/**
 * Validates a string format for UUID v4 conformance.
 */
export function validateAssessmentId(id: string): boolean {
  return UUID_V4_REGEX.test(id);
}

/**
 * Generates a current ISO 8601 UTC timestamp string.
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Parses and validates a raw string input (JSON or YAML) against the AssessmentRequest schema.
 */
export function parseAndValidateAssessmentRequest(raw: string): ValidationResult<AssessmentRequest> {
  let parsed: any;
  try {
    parsed = YAML.parse(raw);
  } catch (error: any) {
    return {
      success: false,
      errors: { parse: `Failed to parse YAML/JSON: ${error.message}` }
    };
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      success: false,
      errors: { payload: 'Payload must be a valid JSON or YAML object' }
    };
  }

  const errors: ValidationErrorDetails = {};

  // 1. Validate assessmentId
  const assessmentId = parsed.assessmentId;
  if (assessmentId === undefined || assessmentId === null) {
    errors.assessmentId = 'Field is required';
  } else if (typeof assessmentId !== 'string') {
    errors.assessmentId = 'Must be a string';
  } else if (!validateAssessmentId(assessmentId)) {
    errors.assessmentId = 'Must be a valid UUID v4 string';
  }

  // 2. Validate project
  const project = parsed.project;
  if (project === undefined || project === null) {
    errors.project = 'Field is required';
  } else if (typeof project !== 'string') {
    errors.project = 'Must be a string';
  } else if (project.trim() === '') {
    errors.project = 'Must not be empty';
  }

  // 3. Validate target
  const target = parsed.target;
  if (target === undefined || target === null) {
    errors.target = 'Field is required';
  } else if (typeof target !== 'string') {
    errors.target = 'Must be a string';
  } else if (target.trim() === '') {
    errors.target = 'Must not be empty';
  } else if (target.includes('..') || target.includes('/') && target.split('/').some(part => part === '..') || target.includes('\\') && target.split('\\').some(part => part === '..')) {
    errors.target = 'Directory traversal sequence (..) is forbidden for security';
  }

  // 4. Validate timestamp
  const timestamp = parsed.timestamp;
  if (timestamp === undefined || timestamp === null) {
    errors.timestamp = 'Field is required';
  } else if (typeof timestamp !== 'string') {
    errors.timestamp = 'Must be a string';
  } else if (!ISO_8601_UTC_REGEX.test(timestamp)) {
    errors.timestamp = 'Must be a valid ISO 8601 UTC timestamp (YYYY-MM-DDTHH:mm:ssZ)';
  } else {
    const parsedTime = Date.parse(timestamp);
    if (isNaN(parsedTime)) {
      errors.timestamp = 'Must be a valid parseable date';
    }
  }

  // 5. Validate providerPreference (Optional)
  const providerPreference = parsed.providerPreference;
  if (providerPreference !== undefined && providerPreference !== null) {
    if (typeof providerPreference !== 'string') {
      errors.providerPreference = 'Must be a string';
    } else if (providerPreference.trim() === '') {
      errors.providerPreference = 'Must not be empty if provided';
    }
  }

  // Check if any errors occurred
  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  return {
    success: true,
    data: {
      assessmentId,
      project: project.trim(),
      target: target.trim(),
      timestamp,
      ...(providerPreference !== undefined && { providerPreference: providerPreference.trim() })
    }
  };
}
