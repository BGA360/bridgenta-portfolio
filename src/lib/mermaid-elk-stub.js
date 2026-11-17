// Stub for Mermaid's optional ELK layout engine.
// BridGenta diagrams use the default Dagre engine.
// Stubbing ELK prevents bundling 1.4 MB of unused Java-compiled JS and avoids false-positive FQDN tokens.
export const diagram = {
  db: {},
  renderer: {},
  parser: { parse: () => {} },
  styles: () => ''
};
