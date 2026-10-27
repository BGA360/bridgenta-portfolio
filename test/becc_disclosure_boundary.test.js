import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('BECC Case Study Public Disclosure Boundary Regression Guard', () => {
  const workspaceDir = process.cwd();
  const beccMarkdownPath = path.join(workspaceDir, 'src', 'content', 'projects', 'becc.md');
  const distHtmlPath = path.join(workspaceDir, 'dist', 'project-becc', 'index.html');

  const FORBIDDEN_TOKENS = [
    { token: 'becc-test-runtime', desc: 'Internal compute service name' },
    { token: 'becc-test-postgres', desc: 'Internal database instance name' },
    { token: 'render_admin', desc: 'Internal database superuser/admin role' },
    { token: 'becc_app', desc: 'Internal application database role' },
    { token: 'becc.becc_audit_records', desc: 'Internal database schema and table name' },
    { token: 'becc_audit_records', desc: 'Internal database table name' },
    { token: 'onrender.com', desc: 'Internal cloud provider default CNAME/FQDN' },
    { token: '1910418b6a6dba83f15be12ab40670b773231ffa67774566512c0ff329517524', desc: 'Internal restore drill test hash' },
    { token: 'GAP-PROD-', desc: 'Internal technical gap ticket identifier' },
    { token: 'DEC-OWNER-', desc: 'Internal owner decision identifier' },
    { token: 'BECC-NEXT-008', desc: 'Internal engineering document identifier' },
    { token: 'BECC_CERTIFICATION_LEVEL', desc: 'Internal governance enum string' },
    { token: 'BECC_PRODUCTION_ENVIRONMENT_CERTIFIED', desc: 'Internal governance enum string' },
    { token: 'basic_1gb', desc: 'Internal cloud provider storage plan identifier' },
    { token: 'absoluter Schutz', desc: 'Overstated claim: absolute security' },
    { token: '24/7 Always-On ohne Unterbrechung', desc: 'Overstated claim: zero downtime uninterrupted 24/7' },
  ];

  it('1. src/content/projects/becc.md does not contain any forbidden operational tokens', () => {
    assert.ok(fs.existsSync(beccMarkdownPath), 'becc.md must exist');
    const content = fs.readFileSync(beccMarkdownPath, 'utf8');

    for (const { token, desc } of FORBIDDEN_TOKENS) {
      assert.equal(
        content.includes(token),
        false,
        `becc.md must not contain forbidden token "${token}" (${desc})`
      );
    }
  });

  it('2. src/content/projects/becc.md maintains truthful engineering principles', () => {
    const content = fs.readFileSync(beccMarkdownPath, 'utf8');
    assert.ok(content.includes('rejectUnauthorized: true'), 'Must mention strict rejectUnauthorized: true');
    assert.ok(content.includes('Frankfurt am Main'), 'Must mention Frankfurt am Main / EU region');
    assert.ok(content.includes('PostgreSQL'), 'Must mention PostgreSQL');
    assert.ok(content.includes('Least Privilege'), 'Must mention Least Privilege principle');
    assert.ok(content.includes('Point-in-Time-Recovery') || content.includes('PITR'), 'Must mention PITR capability');
    assert.ok(content.includes('15,00 €'), 'Must mention budget discipline under 15,00 €');
  });

  it('3. dist/project-becc/index.html (if built) does not leak forbidden operational tokens', () => {
    if (!fs.existsSync(distHtmlPath)) {
      // Build output not yet generated, skip or pass
      return;
    }
    const html = fs.readFileSync(distHtmlPath, 'utf8');
    for (const { token, desc } of FORBIDDEN_TOKENS) {
      assert.equal(
        html.includes(token),
        false,
        `Built dist/project-becc/index.html must not contain forbidden token "${token}" (${desc})`
      );
    }
  });
});
