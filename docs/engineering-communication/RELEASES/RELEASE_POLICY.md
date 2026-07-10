# Release-Richtlinie (Release Policy) — BridGenta Engineering Communication Constitution (BECC)

Dieses Dokument definiert das offizielle Verfahren für Versionsfreigaben, Verfassungsänderungen (Amendments), Kompatibilitätszusagen und das Zurückziehen veralteter Regeln (Deprecation) innerhalb des BECC-Frameworks.

---

## 1. Versionsklassifizierung (Version Classification)

Das BECC-Framework folgt einem semantischen Versionierungskonzept, das an die Anforderungen verfassungsrechtlicher Dokumentation angepasst ist:

### Hauptversionen (Major Releases — z. B. v1.0, v2.0)
- **Geltungsbereich**: Umfassende strukturelle Änderungen an den konstitutionellen Grundlagen (Phase 1) oder grundlegende Neuausrichtungen der Kommunikationsziele.
- **Kompatibilität**: Kann bestehende Dokumente inkompatibel machen, sodass eine Überarbeitung (Migration) erforderlich wird.
- **Freigabe**: Erfordert die einstimmige Genehmigung des Architektur-Boards (BGCF/BPGA/BECC) und eine formale Auditierung.

### Nebenversionen (Minor Releases — z. B. v1.1, v1.2)
- **Geltungsbereich**: Hinzufügen neuer operativer Standards (Phase 2), nützlicher Ergänzungsregeln oder neuer Dokumentenklassen (z. B. White Paper Standard).
- **Kompatibilität**: Abwärtskompatibel. Bestehende, nach v1.0 konforme Dokumente behalten ihre Gültigkeit.
- **Freigabe**: Erfordert ein internes Review und die Mehrheitsentscheidung des Review-Gremiums.

### Verfassungsänderungen (Constitutional Amendments / Patches — z. B. v1.0.1)
- **Geltungsbereich**: Behebung von Widersprüchen, redaktionelle Korrekturen, Klarstellungen in Beispielen oder Fehlerkorrekturen.
- **Kompatibilität**: Vollständig abwärtskompatibel.
- **Freigabe**: Schnelles Peer-Review durch mindestens zwei zertifizierte Reviewer.

---

## 2. Abwärtskompatibilität und Migration (Compatibility)

- **Kompatibilitätsgarantie**: Jedes Dokument, das nach einer bestimmten BECC-Minorversion freigegeben wurde, gilt so lange als konform, bis eine neue Majorversion veröffentlicht wird.
- **Migrationsleitfäden**: Bei der Einführung inkompatibler Änderungen (Major Release) muss das Release-Paket einen detaillierten Migrationspfad enthalten, der beschreibt, wie bestehende Dokumente schrittweise angepasst werden können.

---

## 3. Auslaufpolitik (Deprecation Policy)

Wenn eine Richtlinie oder ein Begriff veraltet ist, wird er wie folgt außer Dienst gestellt:
1. **Status „Veraltet“ (Deprecated)**: Die Richtlinie wird im Dokument als veraltet markiert. Sie darf in neuen Dokumenten nicht mehr angewendet werden, bestehende Dokumente müssen jedoch nicht sofort migriert werden.
2. **Status „Entfernt“ (Removed)**: Mit dem nächsten Major Release wird die Richtlinie vollständig aus dem Regelwerk entfernt. Bestehende Dokumente müssen spätestens jetzt migriert werden, um konform zu bleiben.

---

## 4. Review- und Freigabeschranken (Review Gates)

Jeder Release-Vorgang muss folgende Qualifikationstore durchlaufen:
- **Syntaktische Validierung**: Automatischer Build (Astro/Markdown) muss fehlerfrei durchlaufen.
- **Konsistenzprüfung**: Nachweis, dass der neue Standard im Einklang mit Sprints 0.1 bis 1.0 steht (keine Widersprüche).
- **Abstimmung**: Einbindung aller betroffenen Projektbeteiligten vor dem finalen Merge.
