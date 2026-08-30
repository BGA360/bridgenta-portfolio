import { test, describe, before, after } from 'node:test';
import assert from 'assert';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const testTmpDir = path.join(__dirname, 'tmp-m5-4r1-tests');

const repoRoot = path.resolve(process.cwd(), '..');
const m5IdentityPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_identity.js')).href;
const m5ReadinessPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5_readiness.js')).href;
const m5RetainPath = pathToFileURL(path.join(repoRoot, 'tooling', 'prag_provenance_m5_retain.js')).href;

// @ts-ignore
const { computeM5ImplementationIdentity } = await import(m5IdentityPath);
// @ts-ignore
const { evaluateEnforcementReadiness, validateObservationReport } = await import(m5ReadinessPath);
// @ts-ignore
const { runRetention } = await import(m5RetainPath);

describe('M5.4O-R1 Durable Shadow Observation Evidence Retention', () => {
  before(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
    fs.mkdirSync(testTmpDir, { recursive: true });
  });

  after(() => {
    fs.rmSync(testTmpDir, { recursive: true, force: true });
  });

  const validObsTemplate = {
    schemaVersion: "M5-OBSERVATION-1.0",
    repositoryCommit: "ba0db2986156ad32ce39381d0911450de936e046",
    policyVersion: "M5-POLICY-1.0",
    evaluatorVersion: "M5-EVALUATOR-1.0",
    implementationIdentity: "3e5f71af9a514c70e44cbf791864b98ad4f691217253d14c2e3b6961ed314ed3",
    implementationIdentityScheme: "M5-SOURCE-HASH-1",
    observationMode: "SHADOW",
    shadowGateResult: "SHADOW_PASS",
    subjectCount: 1,
    eligibleCount: 1,
    withheldCount: 0,
    undecidedCount: 0,
    articleResults: [
      {
        subjectId: "src/content/learning/grenzen-automatisierter-linter-checks.md",
        publicationEligibility: "PUBLICATION_ELIGIBLE",
        m5Decision: "ELIGIBLE",
        projectionDiagnostics: [],
        decisionFinality: "FINAL"
      }
    ],
    decisionHashes: [
      {
        subjectId: "src/content/learning/grenzen-automatisierter-linter-checks.md",
        decisionHash: "1985ca3ac4b2392dde9fd9ffcc7c7307bf9da844a87eed290b4f626781aebcbe"
      }
    ],
    globalDiagnostics: [],
    diagnosticMessages: [],
    projectionHash: "b986358249c30b0f687cb45ab4ccf7a2066e0533aede3722e44a8102242b684b"
  };

  function computeHashForObservation(obsObj: any) {
    const payload: { [key: string]: any } = {};
    for (const k of Object.keys(obsObj).sort()) {
      if (k !== 'observationHash') {
        payload[k] = obsObj[k];
      }
    }
    const serialized = JSON.stringify(payload);
    return crypto.createHash("sha256").update(serialized).digest("hex");
  }

  function createEnvelope(obsObj: any) {
    const hash = computeHashForObservation(obsObj);
    return {
      observation: obsObj,
      observationHash: hash,
      execution: {
        workflow: "test-workflow",
        job: "test-job",
        runId: "12345",
        timestamp: new Date().toISOString(),
        runner: "local-test",
        branch: "main"
      }
    };
  }

  test('valid observation persisted', () => {
    const workspace = path.join(testTmpDir, 'valid-persist');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    const res = runRetention(workspace, reportPath);
    assert.strictEqual(res.status, 'PERSISTED');

    const expectedFile = path.join(reportsDir, 'history', 'm5-shadow', envelope.observation.repositoryCommit, `${envelope.observationHash}.json`);
    assert.ok(fs.existsSync(expectedFile));

    const historyContent = JSON.parse(fs.readFileSync(expectedFile, 'utf-8'));
    assert.strictEqual(historyContent.observationHash, envelope.observationHash);
    assert.strictEqual(historyContent.observation.repositoryCommit, envelope.observation.repositoryCommit);
  });

  test('invalid observation refused', () => {
    const workspace = path.join(testTmpDir, 'invalid-refused');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, 'malformed JSON text', 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });
  });

  test('hash mismatch refused', () => {
    const workspace = path.join(testTmpDir, 'hash-mismatch');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    envelope.observationHash = "incorrect_hash_value_xyz"; // force mismatch
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });
  });

  test('missing repositoryCommit refused', () => {
    const workspace = path.join(testTmpDir, 'missing-commit');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const badObs = { ...validObsTemplate };
    // @ts-ignore
    delete badObs.repositoryCommit;

    const envelope = createEnvelope(badObs);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });
  });

  test('missing implementationIdentity refused', () => {
    const workspace = path.join(testTmpDir, 'missing-identity');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const badObs = { ...validObsTemplate };
    // @ts-ignore
    delete badObs.implementationIdentity;

    const envelope = createEnvelope(badObs);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });
  });

  test('missing identity scheme refused', () => {
    const workspace = path.join(testTmpDir, 'missing-scheme');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const badObs = { ...validObsTemplate };
    // @ts-ignore
    delete badObs.implementationIdentityScheme;

    const envelope = createEnvelope(badObs);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });
  });

  test('identical historical record is idempotent', () => {
    const workspace = path.join(testTmpDir, 'idempotent');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    const res1 = runRetention(workspace, reportPath);
    assert.strictEqual(res1.status, 'PERSISTED');

    const res2 = runRetention(workspace, reportPath);
    assert.strictEqual(res2.status, 'IDEMPOTENT_NOOP');
  });

  test('same snapshot + same hash does not overwrite', () => {
    const workspace = path.join(testTmpDir, 'no-overwrite');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    runRetention(workspace, reportPath);

    // Write different execution metadata directly to historical file
    const targetFile = path.join(reportsDir, 'history', 'm5-shadow', envelope.observation.repositoryCommit, `${envelope.observationHash}.json`);
    const originalRetainedContent = fs.readFileSync(targetFile, 'utf-8');

    const res = runRetention(workspace, reportPath);
    assert.strictEqual(res.status, 'IDEMPOTENT_NOOP');

    const finalRetainedContent = fs.readFileSync(targetFile, 'utf-8');
    assert.strictEqual(finalRetainedContent, originalRetainedContent); // Content untouched
  });

  test('same snapshot + different hash preserves contradiction evidence', () => {
    const workspace = path.join(testTmpDir, 'contradiction-evidence');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const obs1 = { ...validObsTemplate };
    const obs2 = { ...validObsTemplate, subjectCount: 1, eligibleCount: 1, projectionHash: "diff_proj_hash_abc" }; // different content

    const env1 = createEnvelope(obs1);
    const env2 = createEnvelope(obs2);

    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');

    fs.writeFileSync(reportPath, JSON.stringify(env1), 'utf-8');
    runRetention(workspace, reportPath);

    fs.writeFileSync(reportPath, JSON.stringify(env2), 'utf-8');
    runRetention(workspace, reportPath);

    const commitDir = path.join(reportsDir, 'history', 'm5-shadow', obs1.repositoryCommit);
    const files = fs.readdirSync(commitDir);
    assert.strictEqual(files.length, 2);
    assert.ok(files.includes(`${env1.observationHash}.json`));
    assert.ok(files.includes(`${env2.observationHash}.json`));
  });

  test('different repository commits are retained separately', () => {
    const workspace = path.join(testTmpDir, 'different-commits');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const obs1 = { ...validObsTemplate, repositoryCommit: "commit_A_123" };
    const obs2 = { ...validObsTemplate, repositoryCommit: "commit_B_456" };

    const env1 = createEnvelope(obs1);
    const env2 = createEnvelope(obs2);

    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');

    fs.writeFileSync(reportPath, JSON.stringify(env1), 'utf-8');
    runRetention(workspace, reportPath);

    fs.writeFileSync(reportPath, JSON.stringify(env2), 'utf-8');
    runRetention(workspace, reportPath);

    assert.ok(fs.existsSync(path.join(reportsDir, 'history', 'm5-shadow', 'commit_A_123', `${env1.observationHash}.json`)));
    assert.ok(fs.existsSync(path.join(reportsDir, 'history', 'm5-shadow', 'commit_B_456', `${env2.observationHash}.json`)));
  });

  test('legacy observation does not join current candidate', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "3e5f71af9a514c70e44cbf791864b98ad4f691217253d14c2e3b6961ed314ed3"
    };

    const obsLegacy = {
      ...validObsTemplate,
      // @ts-ignore
      implementationIdentityScheme: "LEGACY_UNDECLARED",
      observationHash: "legacyHash"
    };

    const res = evaluateEnforcementReadiness([obsLegacy], candidateInfo, testTmpDir, {
      requiredObservationCount: 1,
      requiredUniqueRepositorySnapshots: 1
    });

    assert.strictEqual(res.assessmentState, "INSUFFICIENT_EVIDENCE"); // omitted from candidate segment
    assert.strictEqual(res.stabilitySegments[0].implementationIdentityScheme, "LEGACY_UNDECLARED");
  });

  test('working report remains separate from historical evidence', () => {
    const workspace = path.join(testTmpDir, 'separate-files');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    runRetention(workspace, reportPath);

    const workingContent = fs.readFileSync(reportPath, 'utf-8');
    const targetFile = path.join(reportsDir, 'history', 'm5-shadow', envelope.observation.repositoryCommit, `${envelope.observationHash}.json`);
    const historyContent = fs.readFileSync(targetFile, 'utf-8');

    assert.notStrictEqual(reportPath, targetFile);
    assert.strictEqual(JSON.parse(workingContent).observationHash, JSON.parse(historyContent).observationHash);
  });

  test('candidate stability validation', () => {
    // Adding history files should not modify the M5-SOURCE-HASH-1 implementation identity.
    const identityBefore = computeM5ImplementationIdentity(repoRoot).identity;

    // Create a mock history directory in repoRoot and verify it doesn't affect the hash
    const testHistoryPath = path.join(repoRoot, 'stewardship', 'reports', 'history', 'm5-shadow', 'temp_stability_commit');
    fs.mkdirSync(testHistoryPath, { recursive: true });
    fs.writeFileSync(path.join(testHistoryPath, 'stability_test.json'), JSON.stringify(validObsTemplate));

    try {
      const identityAfter = computeM5ImplementationIdentity(repoRoot).identity;
      assert.strictEqual(identityBefore, identityAfter);
    } finally {
      // Clean up stability test files
      fs.rmSync(path.join(repoRoot, 'stewardship', 'reports', 'history', 'm5-shadow', 'temp_stability_commit'), { recursive: true, force: true });
    }
  });

  test('readiness integration test', () => {
    const candidateInfo = {
      policyVersion: "M5-POLICY-1.0",
      evaluatorVersion: "M5-EVALUATOR-1.0",
      implementationIdentityScheme: "M5-SOURCE-HASH-1",
      implementationIdentity: "3e5f71af9a514c70e44cbf791864b98ad4f691217253d14c2e3b6961ed314ed3"
    };

    const observations: any[] = [];
    const commits = ['commitA', 'commitB', 'commitC', 'commitD', 'commitE'];

    // Generate 10 observations across 5 commits (2 identical observations per commit)
    for (let c = 0; c < 5; c++) {
      const commit = commits[c];
      for (let run = 1; run <= 2; run++) {
        const obs = {
          ...validObsTemplate,
          repositoryCommit: commit,
          projectionHash: `projHash_${commit}` // SAME hash for both runs to prevent determinism failure
        };
        const envelope = createEnvelope(obs);
        observations.push({
          ...envelope.observation,
          observationHash: envelope.observationHash
        });
      }
    }

    const res = evaluateEnforcementReadiness(observations, candidateInfo, testTmpDir, {
      requiredObservationCount: 5,
      requiredUniqueRepositorySnapshots: 5
    });

    assert.strictEqual(res.assessmentState, "ENFORCEMENT_READY");
    assert.strictEqual(res.eligibleObservationCount, 5); // 10 observations deduplicated to 5
    assert.strictEqual(res.sourceRepositoryCommits.length, 5);
  });

  // M5.4O-R2 Idempotency and Workflow Permissions checks
  test('deploy.yml permissions check', () => {
    const yamlPath = path.join(repoRoot, '.github', 'workflows', 'deploy.yml');
    assert.ok(fs.existsSync(yamlPath));
    const content = fs.readFileSync(yamlPath, 'utf-8');

    // 1. Workflow-level contents permission must be read
    const lines = content.split(/\r?\n/);
    let inWorkflowPermissions = false;
    let workflowContentsPermission = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('permissions:')) {
        inWorkflowPermissions = true;
        continue;
      }
      if (inWorkflowPermissions) {
        if (line.startsWith(' ') || line.trim() === '') {
          const match = line.match(/\s*contents:\s*(\w+)/);
          if (match) {
            workflowContentsPermission = match[1];
          }
        } else {
          inWorkflowPermissions = false;
        }
      }
    }
    assert.strictEqual(workflowContentsPermission, 'read', 'Workflow-level contents permission must be read');

    // 2. Parse job-level permissions
    const jobPermissions: { [job: string]: { [perm: string]: string } } = {};
    let currentJob = '';
    let inJobPermissions = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.startsWith('jobs:')) {
        continue;
      }
      const jobMatch = line.match(/^\s{2}(\w+[\w-]*):\s*$/);
      if (jobMatch) {
        currentJob = jobMatch[1];
        jobPermissions[currentJob] = {};
        inJobPermissions = false;
        continue;
      }

      if (currentJob) {
        if (line.match(/^\s{4}permissions:\s*$/)) {
          inJobPermissions = true;
          continue;
        }
        if (inJobPermissions) {
          const indentMatch = line.match(/^(\s*)/);
          const indent = indentMatch ? indentMatch[1].length : 0;
          if (indent > 4 && line.trim() !== '') {
            const permValMatch = line.match(/\s*(\w+[\w-]*):\s*(\w+)/);
            if (permValMatch) {
              jobPermissions[currentJob][permValMatch[1]] = permValMatch[2];
            }
          } else if (line.trim() !== '') {
            inJobPermissions = false;
          }
        }
      }
    }

    assert.ok(jobPermissions['build'], 'build job not found');
    assert.ok(jobPermissions['m5-shadow'], 'm5-shadow job not found');
    assert.ok(jobPermissions['m5-retain'], 'm5-retain job not found');
    assert.ok(jobPermissions['deploy'], 'deploy job not found');

    assert.notStrictEqual(jobPermissions['build']['contents'], 'write', 'build job contents must not be write');
    assert.notStrictEqual(jobPermissions['m5-shadow']['contents'], 'write', 'm5-shadow job contents must not be write');
    assert.strictEqual(jobPermissions['m5-retain']['contents'], 'write', 'm5-retain job contents must be write');
    assert.notStrictEqual(jobPermissions['deploy']['contents'], 'write', 'deploy job contents must not be write');
    assert.strictEqual(jobPermissions['deploy']['pages'], 'write', 'deploy job pages must be write');
    assert.strictEqual(jobPermissions['deploy']['id-token'], 'write', 'deploy job id-token must be write');
  });

  test('identical canonical envelope -> IDEMPOTENT_NOOP', () => {
    const workspace = path.join(testTmpDir, 'envelope-idem');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    const res1 = runRetention(workspace, reportPath);
    assert.strictEqual(res1.status, 'PERSISTED');

    const res2 = runRetention(workspace, reportPath);
    assert.strictEqual(res2.status, 'IDEMPOTENT_NOOP');
  });

  test('same observation hash + modified execution.runId -> HISTORICAL_EVIDENCE_CORRUPTION', () => {
    const workspace = path.join(testTmpDir, 'envelope-runid');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope1 = createEnvelope(validObsTemplate);
    envelope1.execution.runId = "11111";
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope1), 'utf-8');

    runRetention(workspace, reportPath);

    const envelope2 = {
      ...envelope1,
      execution: {
        ...envelope1.execution,
        runId: "22222" // modified
      }
    };
    fs.writeFileSync(reportPath, JSON.stringify(envelope2), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    }, /HISTORICAL_EVIDENCE_CORRUPTION/);
  });

  test('same observation hash + modified execution.timestamp -> HISTORICAL_EVIDENCE_CORRUPTION', () => {
    const workspace = path.join(testTmpDir, 'envelope-timestamp');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope1 = createEnvelope(validObsTemplate);
    envelope1.execution.timestamp = "2026-08-30T10:00:00.000Z";
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope1), 'utf-8');

    runRetention(workspace, reportPath);

    const envelope2 = {
      ...envelope1,
      execution: {
        ...envelope1.execution,
        timestamp: "2026-08-30T11:00:00.000Z" // modified
      }
    };
    fs.writeFileSync(reportPath, JSON.stringify(envelope2), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    }, /HISTORICAL_EVIDENCE_CORRUPTION/);
  });

  test('malformed existing history file -> HISTORICAL_EVIDENCE_CORRUPTION', () => {
    const workspace = path.join(testTmpDir, 'envelope-malformed-existing');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope = createEnvelope(validObsTemplate);
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope), 'utf-8');

    const historyDir = path.join(reportsDir, 'history', 'm5-shadow', envelope.observation.repositoryCommit);
    fs.mkdirSync(historyDir, { recursive: true });
    const targetFile = path.join(historyDir, `${envelope.observationHash}.json`);
    fs.writeFileSync(targetFile, "NOT_JSON_CONTENT", 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    }, /HISTORICAL_EVIDENCE_CORRUPTION/);
  });

  test('existing valid observation but different canonical envelope -> NO OVERWRITE', () => {
    const workspace = path.join(testTmpDir, 'envelope-no-overwrite');
    const reportsDir = path.join(workspace, 'stewardship', 'reports');
    fs.mkdirSync(reportsDir, { recursive: true });

    const envelope1 = createEnvelope(validObsTemplate);
    envelope1.execution.runId = "11111";
    const reportPath = path.join(reportsDir, 'm5-ci-shadow-observation.json');
    fs.writeFileSync(reportPath, JSON.stringify(envelope1), 'utf-8');

    runRetention(workspace, reportPath);

    const targetFile = path.join(reportsDir, 'history', 'm5-shadow', envelope1.observation.repositoryCommit, `${envelope1.observationHash}.json`);
    const historyContentBefore = fs.readFileSync(targetFile, 'utf-8');

    const envelope2 = {
      ...envelope1,
      execution: {
        ...envelope1.execution,
        runId: "22222"
      }
    };
    fs.writeFileSync(reportPath, JSON.stringify(envelope2), 'utf-8');

    assert.throws(() => {
      runRetention(workspace, reportPath);
    });

    const historyContentAfter = fs.readFileSync(targetFile, 'utf-8');
    assert.strictEqual(historyContentBefore, historyContentAfter, 'The existing historical record must not be overwritten');
  });
});
