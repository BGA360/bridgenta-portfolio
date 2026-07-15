import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { AssessmentRequest } from '../shared/types.js';
import { ProjectConfig, ProjectConnectorResult } from './types.js';
import {
  RepositoryBoundaryUnavailable,
  ProjectMismatch,
  FileNotFoundException,
  PathTraversalException,
  MalformedConfigException,
  MissingMetadataException,
  SecurityClassificationException,
  VCSFailureException
} from './exceptions.js';

const execAsync = promisify(exec);

async function runGitCommandWithRetry(cmd: string, cwd: string, retries = 3, delayMs = 100): Promise<string> {
  let attempt = 0;
  while (true) {
    try {
      const { stdout } = await execAsync(cmd, { cwd });
      return stdout.trim();
    } catch (err) {
      attempt++;
      if (attempt >= retries) {
        throw new VCSFailureException();
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function getGitDetails(repoRoot: string): Promise<{ remoteUri: string; branch: string; commitHash: string; status: 'clean' | 'dirty' }> {
  // 1. Get HEAD commit hash
  const commitHash = await runGitCommandWithRetry('git rev-parse HEAD', repoRoot);

  // 2. Get active branch name
  let branch = await runGitCommandWithRetry('git rev-parse --abbrev-ref HEAD', repoRoot);
  if (branch === 'HEAD') {
    // Detached HEAD fallback to active commit SHA
    branch = commitHash;
  }

  // 3. Get remote origin URL
  let remoteUri = '';
  try {
    remoteUri = await runGitCommandWithRetry('git config --get remote.origin.url', repoRoot);
  } catch {
    remoteUri = 'local-only';
  }

  // 4. Get clean/dirty status
  const statusOutput = await runGitCommandWithRetry('git status --porcelain', repoRoot);
  const status = statusOutput === '' ? 'clean' : 'dirty';

  return { remoteUri, branch, commitHash, status };
}

export class ProjectConnectorService {
  public async resolveProject(
    request: AssessmentRequest,
    options?: { strict?: boolean }
  ): Promise<ProjectConnectorResult> {
    const isStrict = options?.strict || process.env.BECC_STRICT === 'true';

    // Validate Request input target against directory traversal
    if (request.target.includes('..') || request.target.split(/[/\\]/).some(part => part === '..')) {
      throw new PathTraversalException();
    }

    const absoluteTargetPath = path.resolve(process.cwd(), request.target);
    if (!fs.existsSync(absoluteTargetPath)) {
      throw new FileNotFoundException();
    }

    if (path.extname(absoluteTargetPath) === '') {
      throw new Error('Target document has no extension');
    }

    // Discover project root (maximum traversal depth: 10)
    let currentDir = path.dirname(absoluteTargetPath);
    let depth = 0;
    const maxDepth = 10;
    let foundRoot = '';

    while (depth < maxDepth) {
      const gitPath = path.join(currentDir, '.git');
      const beccPath = path.join(currentDir, '.becc');
      const beccConfigPath = path.join(currentDir, 'becc.config.json');

      if (fs.existsSync(gitPath) || fs.existsSync(beccPath) || fs.existsSync(beccConfigPath)) {
        foundRoot = currentDir;
        break;
      }

      const parent = path.dirname(currentDir);
      if (parent === currentDir) {
        break;
      }
      currentDir = parent;
      depth++;
    }

    if (!foundRoot) {
      throw new RepositoryBoundaryUnavailable();
    }

    // Path Containment & Symlink boundary checks
    const realRoot = fs.realpathSync(foundRoot);
    const realTarget = fs.realpathSync(absoluteTargetPath);

    const relative = path.relative(realRoot, realTarget);
    const isContained = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    if (!isContained) {
      throw new PathTraversalException();
    }

    // Load Project Metadata
    let configObj: ProjectConfig = {};
    const primaryConfig = path.join(realRoot, '.becc', 'becc.config.json');
    const fallbackConfig = path.join(realRoot, 'becc.config.json');
    let hasConfig = false;
    let configPath = '';

    if (fs.existsSync(primaryConfig)) {
      configPath = primaryConfig;
      hasConfig = true;
    } else if (fs.existsSync(fallbackConfig)) {
      configPath = fallbackConfig;
      hasConfig = true;
    }

    if (hasConfig) {
      try {
        const rawContent = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(rawContent);
        configObj = {
          project: typeof parsed.project === 'string' ? parsed.project : undefined,
          projectId: typeof parsed.projectId === 'string' ? parsed.projectId : undefined,
          projectType: typeof parsed.projectType === 'string' ? parsed.projectType : undefined,
          classification: typeof parsed.classification === 'string' ? parsed.classification : undefined
        };
      } catch (err) {
        throw new MalformedConfigException();
      }
    } else {
      if (isStrict) {
        throw new MissingMetadataException();
      }
    }

    // Resolve Discovered Project Name and verify it matches request project name
    let packageJsonName: string | undefined;
    const packageJsonPath = path.join(realRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (typeof parsed.name === 'string') {
          packageJsonName = parsed.name;
        }
      } catch {
        // Ignore
      }
    }

    const discoveredName = configObj.project || packageJsonName || path.basename(realRoot);
    if (discoveredName.toLowerCase() !== request.project.toLowerCase()) {
      throw new ProjectMismatch();
    }

    // Resolve project ID deterministically
    const PROJECT_IDS: Record<string, string> = {
      'bridgenta': 'bga-platform-id-001',
      'bridgenta-portfolio': 'bga-portfolio-id-002',
      'aeocortex': 'aeocortex-id-003',
      'lumina praxis': 'lumina-praxis-id-004',
      'rooted reality gardens': 'reality-gardens-id-005',
      'starcleaners': 'starcleaners-id-006',
      'fd-ess': 'fd-ess-id-007',
      'builddaddy': 'builddaddy-id-008'
    };

    let projectId = configObj.projectId;
    if (!projectId) {
      const normalized = discoveredName.toLowerCase().trim();
      if (PROJECT_IDS[normalized]) {
        projectId = PROJECT_IDS[normalized];
      } else {
        const hash = crypto.createHash('sha256').update(normalized).digest('hex');
        projectId = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-8${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
      }
    }

    // Resolve project type
    let resolvedProjectType = configObj.projectType;
    if (!resolvedProjectType) {
      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
          if (packageJson.dependencies?.astro || packageJson.devDependencies?.astro) {
            resolvedProjectType = 'static site';
          }
        } catch {
          // Ignore
        }
      }
    }
    if (!resolvedProjectType) {
      resolvedProjectType = 'specs';
    }

    // Extract declared classification
    let declaredClassification = configObj.classification;
    let classificationSource: 'document' | 'config' | undefined = declaredClassification ? 'config' : undefined;

    try {
      const fd = fs.openSync(realTarget, 'r');
      const buffer = Buffer.alloc(1000);
      const bytesRead = fs.readSync(fd, buffer, 0, 1000, 0);
      fs.closeSync(fd);

      const content = buffer.toString('utf-8', 0, bytesRead);
      const match = /classification\s*:\s*["']?(\w+)["']?/i.exec(content);
      if (match && match[1]) {
        declaredClassification = match[1].toLowerCase();
        classificationSource = 'document';
      }
    } catch {
      // Ignore
    }

    if (!declaredClassification) {
      throw new SecurityClassificationException();
    }

    // Retrieve Git Details
    const gitDetails = await getGitDetails(realRoot);

    // Compile result
    const envVar = process.env.BECC_ENV;
    const env: 'production' | 'development' | 'test' = (envVar === 'production' || envVar === 'development' || envVar === 'test')
      ? envVar
      : 'development';

    const result: ProjectConnectorResult = {
      assessmentId: request.assessmentId,
      timestamp: request.timestamp,
      ...(request.providerPreference !== undefined && { providerPreference: request.providerPreference }),
      project: request.project,
      target: request.target,
      repositoryRoot: realRoot,
      projectIdentity: {
        name: discoveredName,
        id: projectId
      },
      repositoryDetails: gitDetails,
      targetDocument: {
        path: path.relative(realRoot, realTarget).replace(/\\/g, '/'),
        hash: crypto.createHash('sha256').update(fs.readFileSync(realTarget)).digest('hex')
      },
      projectType: resolvedProjectType,
      declaredClassification,
      ...(classificationSource && { classificationSource }),
      rawConfig: configObj,
      runtimeMetadata: {
        env,
        os: os.platform(),
        timestamp: new Date().toISOString(),
        processId: process.pid
      },
      status: 'success'
    };

    return result;
  }
}
