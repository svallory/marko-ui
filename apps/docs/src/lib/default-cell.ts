/**
 * The Default cell: a real default, or the marker for a prop the component
 * FIXES on its own `<zag>` tag. marko-zag merges those attributes last
 * (`buildMachineProps`), so the caller's value is silently ignored — showing
 * "Default `false`" there would tell a reader they can change it.
 *
 * Its own module because two consumers render a Default cell: the docs site's
 * api-table.marko and the shared markdown renderer.
 */
export function defaultCell(property: { default?: string; fixed?: string | true }): string {
  if (property.fixed !== undefined) {
    return property.fixed === true ? "`fixed`" : `\`fixed: ${property.fixed}\``;
  }
  return property.default ? `\`${property.default}\`` : "—";
}

/** Explains the `fixed:` cells when a part has any; `null` when it has none. */
export const FIXED_LEGEND =
  "`fixed: X` — the component sets this value itself; a value you pass is ignored. `fixed` — same, but the value is computed.";
