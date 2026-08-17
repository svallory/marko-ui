/**
 * Ported from shadcn's `packages/shadcn/src/styles/create-style-map.ts`.
 *
 * Parses a style CSS file (e.g. `styles-src/style-rhea.css`) into a StyleMap:
 * a record mapping each anchor class (`mu-accordion-trigger`, ...) to the
 * Tailwind classes collected from `@apply` declarations in every rule whose
 * selector targets that class.
 *
 * Differences from the original:
 * - The anchor class prefix is a parameter (default `mu-`; shadcn uses `cn-`).
 * - Validation is a plain runtime check instead of a zod schema, so the
 *   prefix can vary per call.
 */
import postcss from "postcss"
import selectorParser, {
  type ClassName,
  type Selector,
} from "postcss-selector-parser"

export const DEFAULT_PREFIX = "mu-"

export type StyleMap = Record<string, string>

export function createStyleMap(
  input: string,
  prefix: string = DEFAULT_PREFIX
): StyleMap {
  const root = postcss.parse(input)

  const result: Record<string, string> = {}

  root.walkRules((rule) => {
    const selectors = rule.selectors ?? []

    if (selectors.length === 0) {
      return
    }

    const tailwindClasses = extractTailwindClasses(rule)

    if (!tailwindClasses) {
      return
    }

    for (const selector of selectors) {
      const normalizedSelector = normalizeSelector(selector)

      selectorParser((selectorsRoot) => {
        selectorsRoot.each((sel) => {
          const targetClass = findSubjectClass(sel, prefix)

          if (!targetClass) {
            return
          }

          const className = targetClass.value

          if (!className.startsWith(prefix)) {
            return
          }

          result[className] = result[className]
            ? `${tailwindClasses} ${result[className]}`
            : tailwindClasses
        })
      }).processSync(normalizedSelector)
    }
  })

  return validateStyleMap(result, prefix)
}

function validateStyleMap(map: Record<string, string>, prefix: string) {
  for (const [key, value] of Object.entries(map)) {
    if (!key.startsWith(prefix)) {
      throw new Error(
        `Invalid style map key "${key}": expected prefix "${prefix}"`
      )
    }
    if (typeof value !== "string") {
      throw new Error(`Invalid style map value for "${key}": expected string`)
    }
  }
  return map
}

function normalizeSelector(selector: string) {
  return selector.replace(/\s*&\s*/g, "").trim()
}

function extractTailwindClasses(rule: postcss.Rule) {
  const classes: string[] = []

  for (const node of rule.nodes || []) {
    if (node.type === "atrule" && node.name === "apply") {
      const value = node.params.trim()
      if (value) {
        classes.push(value)
      }
    }
  }

  if (classes.length === 0) {
    return null
  }

  return classes.join(" ")
}

function findSubjectClass(selector: Selector, prefix: string) {
  const classNodes: ClassName[] = []

  selector.walkClasses((classNode) => {
    if (classNode.value.startsWith(prefix)) {
      classNodes.push(classNode)
    }
  })

  if (classNodes.length === 0) {
    return null
  }

  return classNodes[classNodes.length - 1]
}
