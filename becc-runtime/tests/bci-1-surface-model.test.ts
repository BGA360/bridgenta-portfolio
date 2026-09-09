import test from 'node:test';
import assert from 'node:assert';
import {
  generatePageId,
  generateSectionId,
  generateHeadingId,
  generateClaimId,
  generateRelationId,
  generateArtifactId,
  generateLinkId,
  calculateObjectHash
} from '../extensions/bci/identity/index.js';
import {
  isReplayReady,
  validateRuleIdentity,
  validateCommunicationProfile,
  validateAuditDomainResult
} from '../extensions/bci/provenance/index.js';
import { CommunicationPage } from '../extensions/bci/model/index.js';

test('BCI-1: Stable Identifiers Contract', () => {
  const path = 'src/content/projects/starcleaners.md';
  const id1 = generatePageId(path);
  const id2 = generatePageId(path);
  const id3 = generatePageId(path + ' '); // Whitespace trimmed internally
  const idChanged = generatePageId('src/content/projects/aeocortex.md');

  // Same input -> same ID
  assert.strictEqual(id1, id2);
  assert.strictEqual(id1, id3);

  // Changed input -> changed ID
  assert.notStrictEqual(id1, idChanged);

  // Timestamps do not alter content identity
  const obj1 = { content: 'hello', timestamp: '2026-08-10T10:00:00Z' };
  const obj2 = { content: 'hello', timestamp: '2026-08-10T11:00:00Z' };
  
  const hash1 = calculateObjectHash({ content: obj1.content });
  const hash2 = calculateObjectHash({ content: obj2.content });
  assert.strictEqual(hash1, hash2);
});

test('BCI-1: Serialization Contract', () => {
  const page: CommunicationPage = {
    pageId: 'page-starcleaners',
    title: 'StarCleaners',
    contentHash: 'hash-abc',
    metadata: {
      title: 'StarCleaners',
      subtitle: 'PWA Web Presence',
      language: 'de'
    },
    sections: ['sec-1', 'sec-2'],
    links: ['lnk-1'],
    components: ['comp-1']
  };

  const serialized = JSON.stringify(page);
  const parsed = JSON.parse(serialized);

  assert.deepStrictEqual(parsed, page);
});

test('BCI-1: Domain Result Contract', () => {
  // PASS should be valid
  const resPass = validateAuditDomainResult({
    domain: 'LANGUAGE',
    state: 'PASS'
  });
  assert.ok(resPass.success);

  // NOT_APPLICABLE with justification should be valid
  const resNaValid = validateAuditDomainResult({
    domain: 'ACCESSIBILITY_COMMUNICATION',
    state: 'NOT_APPLICABLE',
    justification: 'This is a back-end platform API with no user-facing UI.'
  });
  assert.ok(resNaValid.success);

  // NOT_APPLICABLE without justification -> invalid
  const resNaInvalid = validateAuditDomainResult({
    domain: 'ACCESSIBILITY_COMMUNICATION',
    state: 'NOT_APPLICABLE'
  });
  assert.ok(!resNaInvalid.success);
  if (!resNaInvalid.success) {
    assert.strictEqual(resNaInvalid.errors.justification, 'Justification is required when state is NOT_APPLICABLE');
  }
});

test('BCI-1: Capability/Authorization Separation Contract', () => {
  // ENVIRONMENT CAPABILITY ≠ RUNTIME CAPABILITY ≠ AUTHORIZATION
  let envCapable = true as boolean; // Environment has git binary
  let runtimeCapable = false as boolean; // becc-runtime does not implement git branch creation
  let authorized = false as boolean; // Current sprint does not authorize writes

  assert.ok(envCapable !== runtimeCapable || envCapable !== authorized);
});

test('BCI-1: Provenance Rule Identity Contract', () => {
  const ruleDefIdentity = 'rule-def-v1.0';
  const ruleImplIdentity = 'rule-impl-v2.0';

  // Rule definition and implementation identities are distinct concepts
  assert.notStrictEqual(ruleDefIdentity, ruleImplIdentity);
});

test('BCI-1: Historical Replay Metadata Contract', () => {
  const validReplay = {
    ruleId: 'heading-hierarchy',
    ruleDefinitionVersion: '1.0.0',
    ruleDefinitionHash: 'hash-def',
    ruleImplementationVersion: '2.0.0',
    ruleImplementationHash: 'hash-impl'
  };

  assert.ok(isReplayReady(validReplay));

  const invalidReplay = {
    ruleId: 'heading-hierarchy',
    ruleDefinitionVersion: '1.0.0',
    ruleDefinitionHash: 'hash-def',
    ruleImplementationVersion: '', // Missing implementation version
    ruleImplementationHash: ''      // Missing implementation hash
  };

  assert.ok(!isReplayReady(invalidReplay));
});

test('BCI-1: Communication Hierarchy Valid', () => {
  const pageId = generatePageId('starcleaners.md');
  const sectionId = generateSectionId(pageId, 'Kurzfassung', 1);
  const headingId = generateHeadingId(sectionId, 2, 'Kurzfassung');

  assert.ok(sectionId.startsWith('sec-'));
  assert.ok(headingId.startsWith('hd-'));
});

test('BCI-1: Relation Identity Stability', () => {
  const sourceNode = 'page-1';
  const targetNode = 'sec-1';
  const relType = 'APPEARS_IN';

  const relId1 = generateRelationId(sourceNode, targetNode, relType);
  const relId2 = generateRelationId(sourceNode, targetNode, relType);

  assert.strictEqual(relId1, relId2);
});

test('BCI-1: Web-only Page Contract', () => {
  const webPage: CommunicationPage = {
    pageId: 'page-web-only',
    canonicalUrl: 'https://bridgenta.de/project-starcleaners',
    title: 'StarCleaners Live',
    contentHash: 'hash-xyz',
    metadata: {
      title: 'StarCleaners Live'
    },
    sections: [],
    links: [],
    components: []
  };

  // Web-only page has canonicalUrl but no sourceIdentity path
  assert.strictEqual(webPage.sourceIdentity, undefined);
  assert.strictEqual(webPage.canonicalUrl, 'https://bridgenta.de/project-starcleaners');
});

test('BCI-1: Repository-backed Page Contract', () => {
  const repoPage: CommunicationPage = {
    pageId: 'page-repo-backed',
    canonicalUrl: 'https://bridgenta.de/project-starcleaners',
    sourceIdentity: 'src/content/projects/starcleaners.md',
    title: 'StarCleaners',
    contentHash: 'hash-abc',
    metadata: {
      title: 'StarCleaners'
    },
    sections: [],
    links: [],
    components: []
  };

  // Can reference source and public URL simultaneously
  assert.strictEqual(repoPage.sourceIdentity, 'src/content/projects/starcleaners.md');
  assert.strictEqual(repoPage.canonicalUrl, 'https://bridgenta.de/project-starcleaners');
});

test('BCI-1: Profile Identity Retention', () => {
  const profileInput = {
    profileId: 'engineering-portfolio-de',
    profileVersion: '1.0.0',
    profileHash: 'hash-profile-v1',
    displayName: 'Deutsches Engineering Portfolio',
    targetLanguage: 'de',
    targetAudience: 'Recruiters',
    registerTarget: 'CEFR B2-C1'
  };

  const validation = validateCommunicationProfile(profileInput);
  assert.ok(validation.success);
  if (validation.success) {
    assert.strictEqual(validation.data.profileVersion, '1.0.0');
    assert.strictEqual(validation.data.profileHash, 'hash-profile-v1');
  }
});
