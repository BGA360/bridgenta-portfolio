import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import { ProjectConnectorService } from '../connector/project-connector.service.js';
import {
  RepositoryBoundaryUnavailable,
  ProjectMismatch,
  FileNotFoundException,
  PathTraversalException,
  MalformedConfigException,
  MissingMetadataException,
  SecurityClassificationException,
  VCSFailureException
} from '../connector/exceptions.js';
import { AssessmentRequest } from '../shared/types.js';

// Helper to write classification header in a file
function createTestFile(filePath: string, classification?: string) {
  const content = classification
    ? `---\nclassification: ${classification}\n---\nSome content here.\n`
    : `Some content here without classification.\n`;
  fs.writeFileSync(filePath, content, 'utf-8');
}

// Helper to initialize git with mock configs
function initGitRepo(repoDir: string) {
  execSync('git init', { cwd: repoDir, stdio: 'ignore' });
  execSync('git config user.name "Test"', { cwd: repoDir, stdio: 'ignore' });
  execSync('git config user.email "test@example.com"', { cwd: repoDir, stdio: 'ignore' });
}

test('WP-003: Canonical Input & Field Preservation', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-canonical-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    
    // Write config file
    const configPath = path.join(tempRepoDir, 'becc.config.json');
    fs.writeFileSync(configPath, JSON.stringify({
      project: projectName,
      classification: 'public'
    }));

    // Create target document
    const docPath = path.join(tempRepoDir, 'document.md');
    createTestFile(docPath, 'public');

    initGitRepo(tempRepoDir);
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "initial commit"', { cwd: tempRepoDir, stdio: 'ignore' });

    const request: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z',
      providerPreference: 'antigravity'
    };

    const connector = new ProjectConnectorService();
    const result = await connector.resolveProject(request);

    // Verify fields preserved from AssessmentRequest
    assert.strictEqual(result.assessmentId, request.assessmentId);
    assert.strictEqual(result.timestamp, request.timestamp);
    assert.strictEqual(result.providerPreference, request.providerPreference);
    assert.strictEqual(result.project, request.project);
    assert.strictEqual(result.target, request.target);

    // Verify raw facts discovered
    assert.strictEqual(result.projectIdentity.name, projectName);
    assert.strictEqual(result.repositoryRoot, fs.realpathSync(tempRepoDir));
    assert.strictEqual(result.declaredClassification, 'public');
    assert.strictEqual(result.status, 'success');
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Project Name Verification and Mismatch Rejection', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-mismatch-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: projectName,
      classification: 'public'
    }));

    const docPath = path.join(tempRepoDir, 'document.md');
    createTestFile(docPath, 'public');

    initGitRepo(tempRepoDir);
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "init"', { cwd: tempRepoDir, stdio: 'ignore' });

    const request: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: 'SomeOtherProject', // mismatched project name
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };

    const connector = new ProjectConnectorService();
    await assert.rejects(async () => {
      await connector.resolveProject(request);
    }, ProjectMismatch);
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Path Traversal and Containment boundaries', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-traversal-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: projectName,
      classification: 'public'
    }));

    // Create target file outside repository
    const outsideFile = path.join(os.tmpdir(), 'outside_secret.md');
    createTestFile(outsideFile, 'public');

    // Create a symlink inside the repository pointing to the outside file
    const symlinkPath = path.join(tempRepoDir, 'escaped_symlink.md');
    let hasSymlink = false;
    try {
      fs.symlinkSync(outsideFile, symlinkPath);
      hasSymlink = true;
    } catch {
      // Windows might require developer mode for symlinks, skip if unsupported
    }

    const connector = new ProjectConnectorService();

    if (hasSymlink) {
      const request: AssessmentRequest = {
        assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
        project: projectName,
        target: symlinkPath.replace(/\\/g, '/'),
        timestamp: '2026-07-15T12:00:00Z'
      };
      
      // Rejects target document outside repository root (containment check via symlink)
      await assert.rejects(async () => {
        await connector.resolveProject(request);
      }, PathTraversalException);
    }

    // Rejects targets containing directory traversal sequence
    const requestWithTraversal: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: 'docs/../../outside_secret.md',
      timestamp: '2026-07-15T12:00:00Z'
    };
    await assert.rejects(async () => {
      await connector.resolveProject(requestWithTraversal);
    }, PathTraversalException);

    fs.rmSync(outsideFile, { force: true });
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Missing Document and Missing File Extension Rejections', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-missing-doc-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: projectName,
      classification: 'public'
    }));

    // Non-existent target file path
    const requestMissing: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: path.join(tempRepoDir, 'non_existent.md').replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };

    const connector = new ProjectConnectorService();
    await assert.rejects(async () => {
      await connector.resolveProject(requestMissing);
    }, FileNotFoundException);

    // Document with missing file extension
    const noExtensionFile = path.join(tempRepoDir, 'LICENSE');
    fs.writeFileSync(noExtensionFile, 'classification: public\nContent');
    const requestNoExt: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: noExtensionFile.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };
    await assert.rejects(async () => {
      await connector.resolveProject(requestNoExt);
    }, /no extension/);
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Metadata Loading (Precedence & Malformed Config)', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-metadata-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    fs.mkdirSync(path.join(tempRepoDir, '.becc'));

    // Create target document
    const docPath = path.join(tempRepoDir, 'document.md');
    createTestFile(docPath, 'public');

    initGitRepo(tempRepoDir);
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "init"', { cwd: tempRepoDir, stdio: 'ignore' });

    // Scenario A: Malformed Config
    fs.writeFileSync(path.join(tempRepoDir, '.becc', 'becc.config.json'), '{ invalid json ');
    const request: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };
    const connector = new ProjectConnectorService();
    await assert.rejects(async () => {
      await connector.resolveProject(request);
    }, MalformedConfigException);

    // Scenario B: Strict Mode throws on missing config
    fs.rmSync(path.join(tempRepoDir, '.becc', 'becc.config.json'), { force: true });
    await assert.rejects(async () => {
      await connector.resolveProject(request, { strict: true });
    }, MissingMetadataException);

    // Scenario C: Precedence - Primary (.becc/becc.config.json) overrides Fallback (becc.config.json)
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: 'FallbackProject',
      classification: 'restricted'
    }));
    fs.writeFileSync(path.join(tempRepoDir, '.becc', 'becc.config.json'), JSON.stringify({
      project: 'PrimaryProject',
      classification: 'public'
    }));

    const requestPrimary: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: 'PrimaryProject',
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };

    const result = await connector.resolveProject(requestPrimary);
    assert.strictEqual(result.projectIdentity.name, 'PrimaryProject');
    assert.strictEqual(result.declaredClassification, 'public');
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Git facts retrieval (branch, SHA, clean/dirty, detached HEAD)', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-git-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    
    // Create target document
    const docPath = path.join(tempRepoDir, 'document.md');
    createTestFile(docPath, 'public');

    initGitRepo(tempRepoDir);
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "initial commit"', { cwd: tempRepoDir, stdio: 'ignore' });

    const request: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };

    const connector = new ProjectConnectorService();

    // 1. Test clean status
    let result = await connector.resolveProject(request);
    assert.strictEqual(result.repositoryDetails.status, 'clean');
    assert.ok(result.repositoryDetails.commitHash);
    
    // 2. Test dirty status
    fs.writeFileSync(path.join(tempRepoDir, 'dirty.md'), 'dirty content');
    result = await connector.resolveProject(request);
    assert.strictEqual(result.repositoryDetails.status, 'dirty');

    // 3. Test detached HEAD state fallback
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "dirty commit"', { cwd: tempRepoDir, stdio: 'ignore' });
    const commitHash = execSync('git rev-parse HEAD', { cwd: tempRepoDir }).toString().trim();
    
    // Checkout commit directly to trigger detached HEAD state
    execSync(`git checkout ${commitHash}`, { cwd: tempRepoDir, stdio: 'ignore' });

    result = await connector.resolveProject(request);
    // Detached branch name should fall back to commit SHA
    assert.strictEqual(result.repositoryDetails.branch, commitHash);
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});

test('WP-003: Classification Discovery and Precedence', async () => {
  const tempRepoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'becc-classification-'));
  const projectName = path.basename(tempRepoDir);
  try {
    fs.mkdirSync(path.join(tempRepoDir, '.git'));
    
    initGitRepo(tempRepoDir);

    const docPath = path.join(tempRepoDir, 'document.md');
    const connector = new ProjectConnectorService();

    // Scenario A: classification in target document
    createTestFile(docPath, 'public');
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "init"', { cwd: tempRepoDir, stdio: 'ignore' });

    const request: AssessmentRequest = {
      assessmentId: '4f52e1fc-ef73-495f-b1d6-2d00c4721890',
      project: projectName,
      target: docPath.replace(/\\/g, '/'),
      timestamp: '2026-07-15T12:00:00Z'
    };

    let result = await connector.resolveProject(request);
    assert.strictEqual(result.declaredClassification, 'public');
    assert.strictEqual(result.classificationSource, 'document');

    // Scenario B: classification in config fallback
    createTestFile(docPath, undefined); // remove classification from document
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: projectName,
      classification: 'restricted'
    }));
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "config update"', { cwd: tempRepoDir, stdio: 'ignore' });

    result = await connector.resolveProject(request);
    assert.strictEqual(result.declaredClassification, 'restricted');
    assert.strictEqual(result.classificationSource, 'config');

    // Scenario C: document classification overrides config
    createTestFile(docPath, 'private');
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "document classification update"', { cwd: tempRepoDir, stdio: 'ignore' });

    result = await connector.resolveProject(request);
    assert.strictEqual(result.declaredClassification, 'private');
    assert.strictEqual(result.classificationSource, 'document');

    // Scenario D: No classification found anywhere throws SecurityClassificationException
    createTestFile(docPath, undefined);
    fs.writeFileSync(path.join(tempRepoDir, 'becc.config.json'), JSON.stringify({
      project: projectName
    }));
    execSync('git add .', { cwd: tempRepoDir, stdio: 'ignore' });
    execSync('git commit -m "remove config classification"', { cwd: tempRepoDir, stdio: 'ignore' });

    await assert.rejects(async () => {
      await connector.resolveProject(request);
    }, SecurityClassificationException);
  } finally {
    fs.rmSync(tempRepoDir, { recursive: true, force: true });
  }
});
