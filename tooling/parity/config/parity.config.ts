/**
 * parity.config.ts — port-owned configuration naming the two harnesses
 * this repo compares, plus the shared config paths. See PROTOCOL.md for
 * what a "harness" is; see runner/coverage.ts and runner/visual.ts for how
 * this config is consumed.
 *
 * Both `dir` values are directory names under tooling/parity/harnesses/ —
 * each must contain a harness.json (see PROTOCOL.md) plus, once its
 * extract step has run, a parity-facts.json.
 */
export interface ParityConfig {
  /** The upstream (source-of-truth) library's harness. */
  upstream: { dir: string }
  /** Our port's harness. */
  ours: { dir: string }
}

const config: ParityConfig = {
  upstream: { dir: "shadcn" },
  ours: { dir: "marko-ui" },
}

export default config
