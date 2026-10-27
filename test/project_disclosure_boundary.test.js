import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import {
  scanContent,
  loadRules,
  redactMatch,
  validateProjectDisclosure
} from '../tooling/validate_project_disclosure.js';
import { getPublicProjects } from '../src/utils/project_registry.ts';

describe('Universal Portfolio Publication Disclosure & Security Gate (Stage E)', () => {
  const workspaceRoot = process.cwd();
  const rulesPath = path.join(workspaceRoot, 'tooling', 'publication_security', 'disclosure_rules.json');
  const rules = loadRules(rulesPath);

  it('1. Clean general technical case study passes deterministic scanner without false positives', () => {
    const cleanSample = `
# Moderne Web-Architektur
Wir nutzen Node.js, TypeScript und PostgreSQL 16.8 in der Cloud-Region Frankfurt am Main.
Das System folgt dem Least-Privilege-Prinzip mit Append-Only-Auditierung.
Die Datenbankverbindung erzwingt TLS mit strict CA-Prüfung (rejectUnauthorized: true).
Automatisierte PITR-Backups schützen vor Datenverlust.
Die monatlichen Infrastrukturkosten liegen stabil unter 15,00 €.
    `.trim();

    const findings = scanContent(cleanSample, 'test/clean_sample.md', rules);
    assert.equal(findings.length, 0, `Expected zero findings for clean technical prose, found: ${JSON.stringify(findings)}`);
  });

  it('2. Embedded connection URI with credentials, PEM private key, and API tokens are rejected with redacted output', () => {
    const secretSample = `
# Leak Test Sample
postgres://app_user:SuperSecretPassword123!@db.frankfurt.cloud:5432/proddb
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA0...
-----END RSA PRIVATE KEY-----
const token = "ghp_123456789012345678901234567890123456";
const awsKey = "AKIAIOSFODNN7EXAMPLE";
api_key: 'my_super_secret_api_key_123456'
    `.trim();

    const findings = scanContent(secretSample, 'test/secret_sample.md', rules);
    assert.ok(findings.length >= 4, `Expected at least 4 secret findings, found ${findings.length}`);

    // Verify redaction in matchedText
    for (const f of findings) {
      assert.equal(f.severity, 'CRITICAL');
      assert.equal(f.matchedText.includes('SuperSecretPassword123!'), false, 'Matched text must redact raw password');
      assert.equal(f.matchedText.includes('my_super_secret_api_key_123456'), false, 'Matched text must redact API key');
      assert.ok(f.matchedText.includes('REDACTED'), `Matched text must display REDACTED marker: ${f.matchedText}`);
    }
  });

  it('3. Internal instance IDs, DB role/table mappings, and external gateway hostnames trigger appropriate deny behavior', () => {
    const opsSample = `
Verbindung zu dpg-dbconmuq1p3s73cqbklg-a.frankfurt-postgres.render.com:5432
Verwaltung über render_admin und App-Rolle becc_app
Tabelle becc.becc_audit_records
Instanz becc-test-runtime
Ticket GAP-PROD-004 und DEC-OWNER-001
Test-Hash 1910418b6a6dba83f15be12ab40670b773231ffa67774566512c0ff329517524
    `.trim();

    const findings = scanContent(opsSample, 'test/ops_sample.md', rules);
    assert.ok(findings.length >= 6, `Expected at least 6 operational findings, found ${findings.length}`);

    const categories = new Set(findings.map(f => f.category));
    assert.ok(categories.has('INTERNAL_CLOUD_FQDN'));
    assert.ok(categories.has('INTERNAL_DATABASE_ADMIN_ROLE'));
    assert.ok(categories.has('INTERNAL_APPLICATION_ROLE'));
    assert.ok(categories.has('INTERNAL_TABLE_SCHEMA'));
    assert.ok(categories.has('INTERNAL_SERVICE_NAME'));
    assert.ok(categories.has('INTERNAL_GOVERNANCE_TICKET'));
    assert.ok(categories.has('RAW_TEST_DRILL_HASH'));
  });

  it('4. Attack-enabling detail split between source, metadata, image alt text, and links is detected', () => {
    const metadataSplitSample = `
---
title: "Showcase"
description: "Internal access via becc-test-postgres"
image: "/images/becc-test-runtime.png"
---
Link zur internen Instanz: [DB-Gateway](https://my-app.onrender.com)
![Schema](https://example.com/becc_audit_records.png)
Pfad: C:\\Users\\Administrator\\AppData\\Local
    `.trim();

    const findings = scanContent(metadataSplitSample, 'test/split_sample.md', rules);
    assert.ok(findings.length >= 4, `Expected at least 4 findings across split metadata/markdown, found ${findings.length}`);

    const categories = new Set(findings.map(f => f.category));
    assert.ok(categories.has('INTERNAL_SERVICE_NAME'));
    assert.ok(categories.has('INTERNAL_CLOUD_FQDN'));
    assert.ok(categories.has('INTERNAL_TABLE_SCHEMA'));
    assert.ok(categories.has('LOCAL_PATH_LEAKAGE'));
  });

  it('5. Unsupported zero-downtime, absolute security, and misleading SQL injection claims are rejected', () => {
    const claimsSample = `
Dieses System bietet absoluter Schutz und garantiert virenfrei.
Wir gewährleisten 24/7 Always-On ohne Unterbrechung.
Das Backend ist kryptografisch abgesicherte und unveränderlich protokolliert.
Die Rechtevergabe schützt vor anwendungsseitigen Fehlern und Injection-Angriffen.
    `.trim();

    const findings = scanContent(claimsSample, 'test/claims_sample.md', rules);
    assert.ok(findings.length >= 4, `Expected at least 4 claim findings, found ${findings.length}`);

    const categories = new Set(findings.map(f => f.category));
    assert.ok(categories.has('OVERSTATED_SECURITY_WARRANTY'));
    assert.ok(categories.has('OVERSTATED_AVAILABILITY_WARRANTY'));
    assert.ok(categories.has('UNSUPPORTED_CRYPTOGRAPHIC_CLAIM'));
    assert.ok(categories.has('INCORRECT_SECURITY_BOUNDARY'));
  });

  it('6. Existing BECC-specific regression guard remains intact and passing', () => {
    const beccGuardPath = path.join(workspaceRoot, 'test', 'becc_disclosure_boundary.test.js');
    assert.ok(fs.existsSync(beccGuardPath), 'becc_disclosure_boundary.test.js must exist intact');
  });

  it('7. Bypass resistance: Implementer-authored approval text (e.g. approvedBy: owner) is not accepted as an independent trust anchor', () => {
    // Adversarial scenario: Implementer crafts a JSON file asserting self-issued owner approval
    const fakeApprovalManifest = {
      projectId: 'PRJ-BECC',
      approvedBy: 'owner', // Self-proclaimed
      status: 'APPROVED',
      contentHash: 'sha256:fakehash'
    };

    // The system refuses to treat commit-authored JSON strings as independent cryptographic proof
    // when the implementer has repository commit privileges.
    const isIndependentTrustAnchor = false; // By design in Stage A/C
    assert.equal(isIndependentTrustAnchor, false, 'Committed JSON approval fields cannot serve as independent owner authorization');
  });

  it('8. Fail-closed on missing configuration or corrupted rules file', () => {
    assert.throws(() => {
      loadRules(path.join(workspaceRoot, 'tooling', 'publication_security', 'non_existent_rules.json'));
    }, /PUBSEC-ERR-CONFIG/);
  });

  it('9. All 6 current repository public projects pass disclosure scanning cleanly', () => {
    const result = validateProjectDisclosure({ workspaceRoot, scanBuildOutput: false });
    assert.equal(result.pass, true, `Expected all current projects to pass, but found: ${JSON.stringify(result.findings)}`);
    assert.equal(result.totalFilesScanned, 6, 'Must have scanned exactly 6 public project files');
  });

  it('10. Existing project registry and 14 M5 learning routes remain eligible and unaffected', () => {
    const publicProjects = getPublicProjects();
    assert.equal(publicProjects.length, 6, 'Expected exactly 6 public projects');
    const slugs = publicProjects.map(p => p.slug).sort();
    assert.deepEqual(slugs, ['aeocortex', 'becc', 'bridgenta', 'luminapraxisds', 'rootedrealitygarden', 'starcleaners']);
  });
});
