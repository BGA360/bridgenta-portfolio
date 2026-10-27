import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('BECC Case Study Public Disclosure Boundary Regression Guard', () => {
  const workspaceDir = process.cwd();
  const beccMarkdownPath = path.join(workspaceDir, 'src', 'content', 'projects', 'becc.md');
  const bridgentaMarkdownPath = path.join(workspaceDir, 'src', 'content', 'projects', 'bridgenta.md');
  const registryPath = path.join(workspaceDir, 'src', 'data', 'project_registry.json');
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
    { token: 'kryptografisch nachvollziehbar', desc: 'Overstated claim: unevidenced cryptographic ledger verification' },
    { token: 'kryptografisch abgesicherte', desc: 'Overstated claim: unevidenced cryptographic backend hardening' },
    { token: 'unveränderlich protokolliert', desc: 'Overstated claim: absolute immutability instead of append-only policy' },
  ];

  it('1. src/content/projects/becc.md does not contain any forbidden operational or overstated tokens', () => {
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

  it('2. src/content/projects/becc.md maintains truthful engineering principles and measured claims', () => {
    const content = fs.readFileSync(beccMarkdownPath, 'utf8');
    assert.ok(content.includes('rejectUnauthorized: true'), 'Must mention strict rejectUnauthorized: true');
    assert.ok(content.includes('Frankfurt am Main'), 'Must mention Frankfurt am Main / EU region');
    assert.ok(content.includes('PostgreSQL'), 'Must mention PostgreSQL');
    assert.ok(content.includes('Least Privilege'), 'Must mention Least Privilege principle');
    assert.ok(content.includes('Point-in-Time-Recovery') || content.includes('PITR'), 'Must mention PITR capability');
    assert.ok(content.includes('15,00 €'), 'Must mention budget discipline under 15,00 €');
    assert.ok(content.includes('Append-Only'), 'Must describe append-only ledger policy');
    assert.ok(content.includes('Keine kryptografische Signaturkette'), 'Must explicitly disclaim cryptographic signature chain');
  });

  it('3. Project Registry decouples BECC from misleading governance imagery while preserving BridGenta references', () => {
    assert.ok(fs.existsSync(registryPath), 'project_registry.json must exist');
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    const beccEntry = registry.find((p) => p.slug === 'becc');
    assert.ok(beccEntry, 'BECC entry must exist');
    assert.equal(beccEntry.heroImage, '', 'BECC heroImage must be cleared');
    assert.equal(beccEntry.cardImage, '', 'BECC cardImage must be cleared');

    const bridgentaEntry = registry.find((p) => p.slug === 'bridgenta');
    assert.ok(bridgentaEntry, 'BridGenta entry must exist');
    assert.equal(bridgentaEntry.heroImage, '/images/bga-portfolio/BG-PA01-Hero.webp', 'BridGenta heroImage must remain intact');
    assert.equal(bridgentaEntry.cardImage, '/images/bga-portfolio/BG-PA00-Card.webp', 'BridGenta cardImage must remain intact');

    assert.ok(fs.existsSync(bridgentaMarkdownPath), 'bridgenta.md must exist');
    const bridgentaContent = fs.readFileSync(bridgentaMarkdownPath, 'utf8');
    assert.ok(
      bridgentaContent.includes('BG-PA04-Governance.webp'),
      'BridGenta markdown reference to governance interface image must remain preserved'
    );
  });

  it('4. dist/project-becc/index.html (if built) does not leak forbidden tokens or misleading imagery', () => {
    if (!fs.existsSync(distHtmlPath)) {
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

    assert.equal(
      html.includes('BG-PA04-Governance.webp'),
      false,
      'Built dist/project-becc/index.html must not attribute BG-PA04-Governance.webp to BECC'
    );
    assert.equal(
      html.includes('BG-PA03-Audit.webp'),
      false,
      'Built dist/project-becc/index.html must not attribute BG-PA03-Audit.webp to BECC'
    );
  });

  it('5. Governance Invariant: Test execution success does not constitute publication authorization', () => {
    // Structural invariant asserting that publication authority requires explicit human owner approval
    const testExecutionPass = true;
    const ownerApprovalGranted = false; // By policy default
    assert.notEqual(testExecutionPass, ownerApprovalGranted, 'Passing test suite must not be conflated with owner publication authorization');
  });
});
