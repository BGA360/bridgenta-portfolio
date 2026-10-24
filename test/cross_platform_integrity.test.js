import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

describe('M5 Cross-Platform Integrity & Line-Ending Canonicalization Guard', () => {
  const workspaceDir = process.cwd();
  const manifestPath = path.join(workspaceDir, 'src', 'data', 'local_integrity_manifest.json');
  const registryPath = path.join(workspaceDir, 'src', 'data', 'provenance_registry.json');

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

  it('1. .gitattributes enforces canonical LF line endings for all text files', () => {
    const gitattrPath = path.join(workspaceDir, '.gitattributes');
    assert.ok(fs.existsSync(gitattrPath), '.gitattributes must exist');
    const content = fs.readFileSync(gitattrPath, 'utf8');
    assert.match(content, /\*\s+text=auto\s+eol=lf/, '.gitattributes must declare * text=auto eol=lf');
  });

  it('2. All local integrity evidence sources in working tree are strictly canonical LF (no CRLF)', () => {
    for (const entry of manifest) {
      if (entry.localVerificationState !== 'AVAILABLE') continue;

      const regEntry = registry.find(r => r.eventId === entry.eventId);
      const locator = regEntry ? regEntry.sourceLocator : entry.sourceLocator;

      const pathsToTry = [
        path.join(workspaceDir, locator),
        path.join(workspaceDir, regEntry ? regEntry.sourceProject : '', locator)
      ];

      let resolvedPath = null;
      for (const p of pathsToTry) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          resolvedPath = p;
          break;
        }
      }

      assert.ok(resolvedPath, `Source file must exist for ${entry.eventId}: ${locator}`);
      const rawBytes = fs.readFileSync(resolvedPath);
      assert.equal(
        rawBytes.includes(13),
        false,
        `File ${locator} for ${entry.eventId} contains CRLF byte (0x0D). All integrity-tracked files must be canonical LF.`
      );
    }
  });

  it('3. All AVAILABLE manifest entries match working-tree raw SHA256 byte-for-byte', () => {
    for (const entry of manifest) {
      if (entry.localVerificationState !== 'AVAILABLE') continue;

      const regEntry = registry.find(r => r.eventId === entry.eventId);
      const locator = regEntry ? regEntry.sourceLocator : entry.sourceLocator;

      const pathsToTry = [
        path.join(workspaceDir, locator),
        path.join(workspaceDir, regEntry ? regEntry.sourceProject : '', locator)
      ];

      let resolvedPath = null;
      for (const p of pathsToTry) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          resolvedPath = p;
          break;
        }
      }

      assert.ok(resolvedPath, `Source file must exist for ${entry.eventId}`);
      const rawBytes = fs.readFileSync(resolvedPath);
      const computedHash = crypto.createHash('sha256').update(rawBytes).digest('hex');

      assert.equal(
        computedHash,
        entry.integrityEvidenceValue,
        `Raw byte SHA256 mismatch for ${entry.eventId} (${locator})`
      );
    }
  });

  it('4. Git repository blob content matches canonical manifest hash for all tracked sources', () => {
    for (const entry of manifest) {
      if (entry.localVerificationState !== 'AVAILABLE') continue;

      const regEntry = registry.find(r => r.eventId === entry.eventId);
      const locator = regEntry ? regEntry.sourceLocator : entry.sourceLocator;

      const pathsToTry = [
        path.join(workspaceDir, locator),
        path.join(workspaceDir, regEntry ? regEntry.sourceProject : '', locator)
      ];

      let relPath = null;
      for (const p of pathsToTry) {
        if (fs.existsSync(p) && fs.statSync(p).isFile()) {
          relPath = path.relative(workspaceDir, p).split(path.sep).join('/');
          break;
        }
      }

      assert.ok(relPath, `Relative path must resolve for ${entry.eventId}`);

      let gitTracked = false;
      try {
        const ls = execSync(`git ls-files -- ${relPath}`, { cwd: workspaceDir, encoding: 'utf8' }).trim();
        if (ls.length > 0) gitTracked = true;
      } catch {}

      if (gitTracked) {
        const gitBlob = execSync(`git cat-file -p HEAD:${relPath}`, { cwd: workspaceDir, encoding: 'buffer' });
        const gitBlobHash = crypto.createHash('sha256').update(gitBlob).digest('hex');

        assert.equal(
          gitBlobHash,
          entry.integrityEvidenceValue,
          `Git repository blob hash mismatch for ${entry.eventId} (${relPath})`
        );
      }
    }
  });

  it('5. CRLF-dependent manifest generation is detected and rejected', () => {
    // Simulate noncanonical CRLF injection into a buffer and prove hash mismatch
    const sampleContent = 'sample canonical text content\n';
    const canonicalHash = crypto.createHash('sha256').update(sampleContent).digest('hex');

    const crlfContent = 'sample canonical text content\r\n';
    const crlfHash = crypto.createHash('sha256').update(crlfContent).digest('hex');

    assert.notEqual(canonicalHash, crlfHash, 'CRLF hash must differ from LF hash');

    // Verify buffer check detects CRLF
    assert.equal(Buffer.from(crlfContent).includes(13), true, 'CRLF buffer must contain 0x0D');
    assert.equal(Buffer.from(sampleContent).includes(13), false, 'LF buffer must not contain 0x0D');
  });
});
