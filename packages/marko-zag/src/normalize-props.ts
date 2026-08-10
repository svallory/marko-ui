/**
 * normalizeProps for Marko 6 native tags.
 *
 * - `className`→`class`, `htmlFor`→`for`, `onChange`→`onInput`,
 *   `onDoubleClick`→`onDblClick` (Marko lowercases the event name).
 * - style objects: hyphenate camelCase keys (Marko writes keys verbatim).
 * - `event.currentTarget` is unavailable in Marko's delegated events; every
 *   handler is wrapped to shadow it with the element Marko passes as the
 *   handler's 2nd argument.
 * - SSR: handlers are stripped — functions from @zag-js modules are not
 *   Marko-serializable, and server HTML doesn't need them. They re-appear on
 *   the first client recompute (service.start() schedules it).
 * - boolean `aria-*` values are stringified ("true"/"false"); Marko's
 *   boolean-attribute rendering would emit an empty attribute instead.
 */
import { createNormalizer } from "@zag-js/types";
import { isFunction } from "@zag-js/utils";

type Dict = Record<string, any>;

const propMap: Dict = {
  className: "class",
  htmlFor: "for",
  defaultValue: "value",
  defaultChecked: "checked",
  onChange: "onInput",
  onDoubleClick: "onDblClick",
};

const uppercasePattern = /[A-Z]/g;
function hyphenate(name: string) {
  if (name.startsWith("--")) return name;
  return name.replace(uppercasePattern, (m) => "-" + m.toLowerCase());
}

function cssify(style: Dict) {
  const css: Dict = {};
  for (const property in style) {
    const value = style[property];
    if (typeof value !== "string" && typeof value !== "number") continue;
    css[hyphenate(property)] = value;
  }
  return css;
}

function wrapHandler(fn: (event: Event) => void) {
  return function (event: Event, el?: Element) {
    if (el) {
      Object.defineProperty(event, "currentTarget", {
        get: () => el,
        configurable: true,
      });
    }
    return fn(event);
  };
}

const isServer = typeof document === "undefined";

export const normalizeProps = createNormalizer<any>((props: Dict) => {
  const normalized: Dict = {};
  for (const key in props) {
    const value = props[key];
    if (key === "readOnly" && value === false) continue;
    if (key === "children") continue;
    if (key === "style" && typeof value === "object" && value !== null) {
      normalized.style = cssify(value);
      continue;
    }
    const target = key in propMap ? propMap[key] : key;
    if (/^on[A-Z]/.test(target) && isFunction(value)) {
      if (!isServer) normalized[target] = wrapHandler(value);
      continue;
    }
    if (isServer && isFunction(value)) continue;
    if (typeof value === "boolean" && target.startsWith("aria-")) {
      normalized[target] = String(value);
      continue;
    }
    normalized[target] = value;
  }
  return normalized;
});
