/**
 * @file mermaid-elk-stub.js
 * @description Controlled stub for Mermaid's optional ELK layout engine.
 *
 * RATIONALE & NECESSITY:
 * 1. Mermaid 10 includes an optional experimental ELK layout engine (@mermaid-js/layout-elk)
 *    which transpiles the Eclipse Layout Kernel from Java to JS (~1.4 MB).
 * 2. Minified ELK contains Java package strings such as 'org.eclipse.elk.alg.common.nodespacing.internal',
 *    triggering false positives against publication security rule OPS-PAT-CLOUD-INTERNAL-FQDN.
 * 3. BridGenta case-study diagrams exclusively utilize the standard Dagre engine (e.g. 'flowchart', 'graph').
 * 4. Build-time aliasing in astro.config.mjs safely eliminates 1.4 MB of unused code and avoids
 *    security-scanner false positives without weakening or modifying scanner rules.
 *
 * SAFETY & CONTROLLED ERROR CONTRACT:
 * If a diagram explicitly requests the ELK layout, this stub throws a clear, controlled error
 * informing the author that ELK is not bundled, prohibiting silent rendering of invalid or incomplete diagrams.
 */

export const UNSUPPORTED_ELK_ERROR =
  'Unsupported layout engine: ELK layout is not bundled in this build. Please use the default Dagre engine (e.g. "flowchart" or "graph").';

export const parser = {
  parse: (_text) => {
    throw new Error(UNSUPPORTED_ELK_ERROR);
  }
};

export const renderer = {
  draw: () => {
    throw new Error(UNSUPPORTED_ELK_ERROR);
  },
  getClasses: () => ({})
};

export const db = {
  clear: () => {}
};

export const styles = () => '';

export const diagram = {
  db,
  renderer,
  parser,
  styles
};

export default {
  diagram,
  parser,
  renderer,
  db,
  styles,
  UNSUPPORTED_ELK_ERROR
};
