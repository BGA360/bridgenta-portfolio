# Leitfaden für Maintainer (Maintainer Guide) — BECC Release-Management

Dieses Dokument beschreibt die Prozesse und Verantwortlichkeiten für Maintainer der **BridGenta Engineering Communication Constitution (BECC)**. Es definiert den Release-Ablauf, das Änderungs-Management und die technische Absicherung veröffentlichter Versionen.

---

## 1. Veröffentlichungs-Workflow (Release Workflow)

Maintainer begleiten und kontrollieren den gesamten Lebenszyklus einer neuen BECC-Version von der Entstehung bis zur Freigabe:

```text
Entwicklung im Feature-Branch (docs/becc-<name>)
                    │
                    ▼
          Lokale Validierung (npm run build & Linter)
                    │
                    ▼
     Pull Request öffnen (Zuweisung via CODEOWNERS)
                    │
                    ▼
       CI-Durchlauf abwarten (Status checks pass)
                    │
                    ▼
      Formelle Freigabe (Review & Freigabe-Zertifikat)
                    │
                    ▼
      Merge durch Maintainer (Kein automatischer Merge)
```

---

## 2. Erstellung des Release-Manifests (Release Manifest Generation)

Jeder Release-Candidate (RC) und jeder finale Release-Stand muss kryptografisch abgesichert werden. Hierzu wird im Zuge des Release-Sprints eine `release-manifest.json` im Release-Verzeichnis erzeugt:

1. **Manifest-Struktur**: Das Manifest muss als JSON-Datei alle zum Release gehörenden verfassungsrelevanten Dokumente sowie deren SHA-256-Prüfsummen enthalten.
2. **Generierungsprozess**: Das Manifest wird mittels eines Node.js-Skripts oder manueller Berechnung erzeugt. Beispiel für ein Node-Skript zur Hash-Berechnung:
   ```javascript
   const crypto = require('crypto');
   const fs = require('fs');
   const fileBuffer = fs.readFileSync(filePath);
   const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
   ```
3. **Pflege**: Bei jeder inhaltlichen Überarbeitung eines Dokuments während des Release-Sprints müssen die Hashes in `release-manifest.json` aktualisiert werden, bevor die Freigabe erteilt wird.

---

## 3. Review- und Freigaberegeln (Review & Merge Policies)

- **CODEOWNERS-Erzwingung**: Merge-Entscheidungen dürfen nur von Maintainern getroffen werden, die in der Datei `/CODEOWNERS` als Eigentümer der betroffenen Verzeichnisse registriert sind.
- **CI-Validierung**: Kein Pull Request darf gemergt werden, wenn die automatischen GitHub Actions Validierungen (Build, Lint, Link-Prüfung) fehlgeschlagen sind.
- **Erzwingung der Absprachen**: Selbst wenn alle CI-Tests erfolgreich sind und Reviews vorliegen, wird der Merge erst nach expliziter Anweisung der Freigabeinstanz ausgeführt.
