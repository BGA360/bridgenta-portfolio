import fs from 'node:fs';
import path from 'node:path';
import { IResolverConfig } from './types.js';
import { MissingFolderException, MissingEntryPointException, PathTraversalException } from './exceptions.js';

export class CrawlerService {
  /**
   * Resolves and validates a path against a list of configured roots to prevent boundary escapes.
   */
  public resolveAndValidatePath(targetPath: string, roots: readonly string[]): string {
    const resolvedPath = path.resolve(targetPath);
    
    // Check for traversal sequences before resolving
    const normalizedTarget = targetPath.replace(/\\/g, '/');
    if (normalizedTarget.includes('../') || normalizedTarget.includes('..\\')) {
      throw new PathTraversalException();
    }

    // Verify the resolved path starts with at least one of the configured roots
    const isWithinBounds = roots.some(root => {
      const resolvedRoot = path.resolve(root);
      // Ensure absolute match or subpath match
      return resolvedPath === resolvedRoot || resolvedPath.startsWith(resolvedRoot + path.sep);
    });

    if (!isWithinBounds) {
      throw new PathTraversalException();
    }

    // Protect against symlink escapes
    try {
      const realPath = fs.realpathSync(resolvedPath);
      const isRealWithinBounds = roots.some(root => {
        const resolvedRoot = path.resolve(root);
        return realPath === resolvedRoot || realPath.startsWith(resolvedRoot + path.sep);
      });
      if (!isRealWithinBounds) {
        throw new PathTraversalException();
      }
      return realPath;
    } catch {
      throw new PathTraversalException();
    }
  }

  /**
   * Recursively scans directories to discover candidate files within traversal limits.
   */
  public discoverFiles(
    currentDir: string,
    config: IResolverConfig,
    depth = 0
  ): string[] {
    let validatedDir: string;
    try {
      validatedDir = this.resolveAndValidatePath(currentDir, config.knowledgeRoots);
    } catch (err) {
      if (err instanceof PathTraversalException) {
        throw err;
      }
      throw new MissingFolderException(path.basename(currentDir));
    }

    if (depth > config.traversalDepthLimit) {
      return [];
    }

    // Check if path is in exclusions
    const isExcluded = config.exclusionPaths.some(ex => {
      const resolvedEx = path.resolve(ex);
      return validatedDir === resolvedEx || validatedDir.startsWith(resolvedEx + path.sep);
    });

    if (isExcluded) {
      return [];
    }

    try {
      const entries = fs.readdirSync(validatedDir, { withFileTypes: true });
      const files: string[] = [];

      for (const entry of entries) {
        const fullPath = path.join(validatedDir, entry.name);

        if (entry.isDirectory()) {
          files.push(...this.discoverFiles(fullPath, config, depth + 1));
        } else if (entry.isFile()) {
          // Check extension
          const ext = path.extname(entry.name);
          if (config.permittedFileTypes.includes(ext)) {
            // Verify not excluded file
            const isFileExcluded = config.exclusionPaths.some(ex => {
              const resolvedEx = path.resolve(ex);
              const resolvedFile = path.resolve(fullPath);
              return resolvedFile === resolvedEx;
            });
            if (!isFileExcluded) {
              files.push(fullPath);
            }
          }
        }
      }
      return files;
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        throw new MissingFolderException(path.basename(currentDir));
      }
      throw err;
    }
  }

  /**
   * Reads a file synchronously (read-only) after validation.
   */
  public readFile(filePath: string, roots: readonly string[]): string {
    const validatedPath = this.resolveAndValidatePath(filePath, roots);
    try {
      return fs.readFileSync(validatedPath, 'utf8');
    } catch (err: any) {
      if (err.code === 'ENOENT') {
        throw new MissingEntryPointException(path.basename(filePath));
      }
      throw err;
    }
  }
}
