# marko-zag

Zag.js v1 bindings for Marko 6. SSR-safe: server renders full aria/data attributes from a never-started machine; the client builds its own service on mount and events attach on first update.

Ships TypeScript and `.marko` source directly — your Marko build (Vite / `@marko/run`) compiles it like your own code, no extra config. Go-to-definition lands in real source.

> ⚠️ Versions 0.0.x targeted Marko 5 + Zag 0.31 and are unrelated. There is no migration path; 0.1+ is a rewrite for Marko 6 + Zag v1.

## Usage

```marko
import * as tabs from "@zag-js/tabs";
import { createService, ssrService, normalizeProps } from "marko-zag";

<id/uid/>
<let/rev=0/>
<let/svc=null/>
<const/machineProps=() => ({ id: uid, defaultValue: "one" })/>
<lifecycle
  onMount() {
    svc = createService(tabs.machine, machineProps, () => { rev += 1 });
    svc.start();
  }
  onDestroy() { svc?.stop() }
/>
<const/computeUi=() => {
  const api = tabs.connect(svc ?? ssrService(tabs.machine, machineProps), normalizeProps);
  return { root: api.getRootProps(), list: api.getListProps() /* ... */ };
}/>
<const/ui=(rev, computeUi())/>

<div ...ui.root>...</div>
```

Why this shape: Marko's resumability serializes reactive state — it never re-runs render in the browser. Zag services and `connect()` apis contain module functions and are unserializable, so only a **plain attrs snapshot** may be reactive. The `computeUi` template closure keeps the api out of state; `(rev, ...)` makes the machine's notify the recompute trigger.

Also included:

- `normalizeProps` — Marko-specific: `class`/`for` renames, style-object hyphenation, `event.currentTarget` shadowing (Marko delegates events and bans `currentTarget`), SSR handler stripping, boolean `aria-*` stringification.
- `<portal to="...">` — renders inline on the server, reparents to the target (default `body`) on mount.

For controlled props, re-notify the service when reactive inputs change:

```marko
<script>
  input.value;
  svc?.propsChanged();
</script>
```
