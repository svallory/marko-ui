/**
 * Extracts the public API surface of every registry component into one
 * checked-in artifact: apps/docs/src/lib/api-reference.json.
 *
 * Run: bun tooling/extract-api.ts   (script: `extract:api`)
 *
 * How it works
 * ------------
 * `.marko` files cannot be fed to the compiler. But every component in this
 * registry keeps its entire TypeScript region — imports, helper interfaces, and
 * the `export type Input` / `export interface Input` declaration — above the
 * first line-initial `<` tag. That leading slice IS valid standalone
 * TypeScript, so the script carves it out into a `.ts` twin sitting at the
 * component's own path (so relative imports like `./variants.ts` and the
 * `#lib/*` subpath still resolve) and loads the whole set as one project.
 *
 * With a real checker in hand, `MachineInput<Tag, Props>` resolves for free:
 * it is `Marko.Input<Tag> & Omit<Props, "id"> & { id?: string }`, so the
 * flattened property list of `Input` already contains the native attributes,
 * the Zag machine props, and the component's own sugar props. What the raw
 * list does NOT tell you is which is which — and a `<div>`'s native attributes
 * alone are ~370 props, which would drown the real API. So each property is
 * classified by where it is *declared*:
 *
 *   machine  — any declaration inside a `@zag-js/*` package
 *   variant  — any declaration inside the component's own `variants.ts` (cva)
 *   own      — declared in the component file itself (sugar like `checkedChange`)
 *   native   — declared only by marko's own tag typings
 *
 * Classification is by *any* declaration, machine first: props like `checked`
 * or `disabled` are declared by both the native `<input>` typing and the Zag
 * machine, and the machine's meaning is the documented one.
 *
 * The ~370 native attributes are deliberately NOT enumerated; they are reduced
 * to a single `nativeAttributes` note naming the tag they come from.
 *
 * TypeScript 7
 * ------------
 * typescript@7 (the native `tsgo` compiler) ships no in-process JS compiler
 * API: there is no `ts.createProgram`, no `ts.CompilerHost`, and no synchronous
 * `ts.*` namespace to import. What it does ship is `typescript/unstable/sync`,
 * a client for an out-of-process compiler that exposes the same checker
 * vocabulary (`getPropertiesOfType`, `typeToString`, `getExportsOfModule`, …)
 * over an RPC channel. Two consequences shape this file:
 *
 *  - That compiler reads the REAL file system; a virtual `CompilerHost` has no
 *    equivalent. The `.ts` twins are therefore written to disk next to their
 *    `.marko` source for the duration of the run and removed in a `finally`.
 *    They are named `__api__<part>.ts` and are git-ignored.
 *  - The RPC channel needs Node's `stdout._handle.fd`, which Bun does not
 *    expose (`TypeError: undefined is not an object (evaluating
 *    'stdout._handle.fd')`). `bun tooling/extract-api.ts` therefore re-executes
 *    itself under `node` — see `main()`.
 *
 * A few names moved between TS 5 and TS 7 and are called out at their use
 * sites: `questionToken` is now `postfixToken`, `isPropertySignature` is now
 * `isPropertySignatureDeclaration`, and `TypeFormatFlags` folded into
 * `NodeBuilderFlags` (the two flags used here keep their numeric values).
 */
import { API, SymbolFlags, NodeBuilderFlags } from "typescript/unstable/sync";
import type { Checker, Project, Symbol as TsSymbol } from "typescript/unstable/sync";
import type { Node, SourceFile } from "typescript/unstable/ast";
import {
  isPropertySignatureDeclaration,
  isPropertyAssignment,
  isIdentifier,
  isStringLiteral,
  isObjectLiteralExpression,
  isCallExpression,
} from "typescript/unstable/ast/is";
import { readdir, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";

const ROOT = new URL("../packages/shadcn/", import.meta.url).pathname;
const REGISTRY_DIR = ROOT;
const UI_DIR = join(ROOT, "ui");
const OUT_FILE = process.env.API_REFERENCE_OUT
  ? process.env.API_REFERENCE_OUT
  : join(ROOT, "../../apps/docs/src/lib/api-reference.json");

/** The generated project the twins are loaded through; removed after the run. */
const PROJECT_FILE = join(REGISTRY_DIR, "tsconfig.api-extract.json");

/**
 * The compiler options the extraction runs under. These are the options the
 * pre-TS-7 implementation passed to `ts.createProgram` directly; TS 7 only
 * loads options from a config file, so they are written to `PROJECT_FILE`.
 */
const COMPILER_OPTIONS = {
  target: "ES2022",
  module: "ESNext",
  moduleResolution: "bundler",
  strict: true,
  skipLibCheck: true,
  types: ["marko", "node"],
  allowImportingTsExtensions: true,
  noEmit: true,
  baseUrl: ".",
  paths: { "#lib/*": ["./lib/*"] },
};

/** A prop's origin, which is also how the docs group it. */
type PropertyKind = "machine" | "variant" | "own" | "native";

interface PropertyEntry {
  name: string;
  type: string;
  required: boolean;
  kind: PropertyKind;
  description?: string;
  /** Variant props only: the literal option names (e.g. ["default","sm","lg"]). */
  options?: string[];
  /** Variant props only: the cva `defaultVariants` entry, when present. */
  default?: string;
}

interface PartEntry {
  /** File name inside the component directory, e.g. "trigger.marko". */
  file: string;
  /** Export-ish name derived from the file, e.g. "trigger". */
  name: string;
  properties: PropertyEntry[];
  /** Tag whose native attributes this part accepts, when it extends one. */
  nativeAttributes?: string;
  machineModule?: string;
}

interface ComponentEntry {
  name: string;
  /** npm package of the Zag machine the root part drives, if any. */
  machineModule?: string;
  parts: PartEntry[];
}

/**
 * Carves the leading TypeScript region out of a `.marko` source: everything
 * above the first line that *starts* a Marko tag. Every component in this
 * registry declares `Input` in that region (verified across all 139 files);
 * a file that ever stops doing so surfaces as a missing `Input` export rather
 * than as silently wrong output, and `main()` reports it.
 */
function extractTypeScriptRegion(markoSource: string): string {
  const lines = markoSource.split("\n");
  const firstTagLine = lines.findIndex((line) => line.startsWith("<"));
  const region = firstTagLine === -1 ? lines : lines.slice(0, firstTagLine);
  return region.join("\n");
}

/** Where the `.ts` twin of a `.marko` file lives (same directory). */
function virtualPathFor(markoPath: string): string {
  return join(dirname(markoPath), `__api__${basename(markoPath, ".marko")}.ts`);
}

/** The `Tag` of a `Marko.Input<Tag>` / `MachineInput<Tag, …>` written in the source text. */
function findNativeTag(typeScriptRegion: string): string | undefined {
  const machineInputTag = /MachineInput<\s*"([^"]+)"/.exec(typeScriptRegion);
  if (machineInputTag?.[1]) return machineInputTag[1];
  const markoInputTag = /Marko\.Input<\s*"([^"]+)"/.exec(typeScriptRegion);
  return markoInputTag?.[1];
}

/** The `@zag-js/*` package the file imports, if any. */
function findMachineModule(typeScriptRegion: string): string | undefined {
  const match = /from\s+"(@zag-js\/[^"]+)"/.exec(typeScriptRegion);
  return match?.[1];
}

/**
 * The type-display flags the docs artifact is written with. In TS 5 these were
 * `ts.TypeFormatFlags.NoTruncation | UseSingleQuotesForStringLiteralType`; TS 7
 * folded both into `NodeBuilderFlags` with the same numeric values, so the
 * rendered strings are unchanged.
 */
const TYPE_FORMAT_FLAGS =
  NodeBuilderFlags.NoTruncation | NodeBuilderFlags.UseSingleQuotesForStringLiteralType;

/**
 * Resolves the `Input` export to a concrete type.
 *
 * The pre-TS-7 implementation additionally re-instantiated generic
 * `Input<T = …>` declarations with each parameter's default, because an
 * uninstantiated generic reported no properties. The TS 7 checker already
 * resolves the declared type of a generic alias against its defaults, so
 * `getDeclaredTypeOfSymbol` alone reproduces the old output; the manual
 * instantiation (which relied on `getTypeAliasInstantiation` /
 * `createTypeReference`, neither of which TS 7 exposes) is no longer needed.
 */
function resolveInputType(checker: Checker, sourceFile: SourceFile) {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return undefined;
  const inputSymbol = checker
    .getExportsOfModule(moduleSymbol)
    .find((exported) => exported.name === "Input");
  if (!inputSymbol) return undefined;
  return checker.getDeclaredTypeOfSymbol(inputSymbol);
}

/**
 * Declaration paths as TS 7 reports them are canonicalized — on this
 * case-insensitive file system that means lower-cased, so a path built with
 * `join()` (which preserves the real casing of `/Users/...`) never compares
 * equal to one read off a declaration. Every path comparison in this file goes
 * through this normalization.
 */
function canonicalPath(fileName: string): string {
  return fileName.toLowerCase();
}

/** The file each of a symbol's declarations lives in, canonicalized. */
function declarationFilesOf(property: TsSymbol): string[] {
  return property.declarations.map((declaration) => canonicalPath(declaration.path as string));
}

function classifyProperty(
  property: TsSymbol,
  ownFileName: string,
  variantsFileName: string,
): PropertyKind {
  const declarationFiles = declarationFilesOf(property);
  // Machine first: `checked`, `disabled`, `name`, … are declared by BOTH the
  // native tag typing and the Zag machine, and the machine's is the real one.
  if (declarationFiles.some((file) => file.includes("@zag-js/"))) return "machine";
  if (declarationFiles.some((file) => file === variantsFileName)) return "variant";
  if (declarationFiles.some((file) => file === ownFileName)) return "own";
  return "native";
}

/**
 * The declaration that decided a prop's `kind` — the one whose type and doc
 * comment the docs should show, rather than the checker's intersection of
 * every declaration that happens to share the name.
 */
function authoritativeDeclaration(
  property: TsSymbol,
  kind: PropertyKind,
  ownFileName: string,
  variantsFileName: string,
  project: Project,
): Node | undefined {
  const matches = (test: (fileName: string) => boolean) =>
    property.declarations.find((declaration) => test(canonicalPath(declaration.path as string)));
  const handle = (() => {
    switch (kind) {
      case "machine":
        return matches((fileName) => fileName.includes("@zag-js/"));
      case "variant":
        return matches((fileName) => fileName === variantsFileName);
      case "own":
        return matches((fileName) => fileName === ownFileName);
      case "native":
        return undefined;
    }
  })();
  return handle?.resolve(project);
}

/**
 * The plain-text JSDoc body attached directly to ONE declaration.
 *
 * `Checker.getDocumentationCommentOfSymbol` is symbol-wide: for a prop declared
 * by both the native tag typing and a machine it concatenates both comments.
 * The docs want the comment of the declaration that decided the prop's kind, so
 * this reads the `jsDoc` nodes hanging off that declaration alone. In TS 7 a
 * `JSDoc` node's `comment` is a node array rather than a string, so the text is
 * assembled from the comment parts.
 */
function declarationDocumentation(declaration: Node): string {
  const jsDocNodes = (declaration as { jsDoc?: readonly unknown[] }).jsDoc ?? [];
  const commentText = (comment: unknown): string => {
    if (typeof comment === "string") return comment;
    if (Array.isArray(comment)) {
      return comment.map((part) => (part as { text?: string }).text ?? "").join("");
    }
    return "";
  };
  return jsDocNodes
    .map((node) => commentText((node as { comment?: unknown }).comment))
    .filter((text) => text.length > 0)
    .join("\n")
    .trim();
}

/**
 * Reads the cva `variants` block out of a component's `variants.ts` so the
 * docs can list a variant's actual options and its `defaultVariants` value —
 * neither of which is recoverable from `VariantProps`, whose type is just a
 * union of string literals with no notion of which one is the default.
 *
 * This walks the parsed source file the project already holds, so the cva
 * config is read from the same AST the checker sees.
 */
function readVariantMetadata(
  variantsFileName: string,
  project: Project,
): Map<string, { options: string[]; default?: string }> {
  const metadata = new Map<string, { options: string[]; default?: string }>();
  if (!existsSync(variantsFileName)) return metadata;
  const source = project.program.getSourceFile(variantsFileName);
  if (!source) return metadata;

  const objectLiteralProperty = (object: any, name: string): any => {
    for (const member of object.properties) {
      if (!isPropertyAssignment(member)) continue;
      const memberName = isIdentifier(member.name)
        ? member.name.text
        : isStringLiteral(member.name)
          ? member.name.text
          : undefined;
      if (memberName === name) return member.initializer;
    }
    return undefined;
  };

  const visit = (node: any): void => {
    if (isCallExpression(node) && isIdentifier(node.expression) && node.expression.text === "cva") {
      const config = node.arguments[1];
      if (config && isObjectLiteralExpression(config)) {
        const variants = objectLiteralProperty(config, "variants");
        const defaults = objectLiteralProperty(config, "defaultVariants");
        if (variants && isObjectLiteralExpression(variants)) {
          for (const group of variants.properties) {
            if (!isPropertyAssignment(group)) continue;
            const groupName = isIdentifier(group.name)
              ? group.name.text
              : isStringLiteral(group.name)
                ? group.name.text
                : undefined;
            if (!groupName || !isObjectLiteralExpression(group.initializer)) continue;
            const options = group.initializer.properties.flatMap((option: any) => {
              if (!isPropertyAssignment(option)) return [];
              if (isIdentifier(option.name) || isStringLiteral(option.name)) {
                return [option.name.text];
              }
              return [];
            });
            let defaultOption: string | undefined;
            if (defaults && isObjectLiteralExpression(defaults)) {
              const value = objectLiteralProperty(defaults, groupName);
              if (value && isStringLiteral(value)) defaultOption = value.text;
            }
            metadata.set(groupName, { options, default: defaultOption });
          }
        }
      }
    }
    node.forEachChild?.(visit);
  };
  visit(source);
  return metadata;
}

async function extract(): Promise<void> {
  const componentNames = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  // Pass 1 — carve every .marko file's TypeScript region into a .ts twin on
  // disk, and load them all as ONE project. One project means the checker
  // resolves cross-component and node_modules types once instead of 139 times.
  const twinFiles = new Map<string, string>();
  const sourceRegions = new Map<string, string>();
  const componentFiles = new Map<string, string[]>();

  for (const componentName of componentNames) {
    const componentDir = join(UI_DIR, componentName);
    const entries = (await readdir(componentDir, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith(".marko"))
      .map((entry) => entry.name)
      .sort();
    componentFiles.set(componentName, entries);
    for (const fileName of entries) {
      const markoPath = join(componentDir, fileName);
      const region = extractTypeScriptRegion(await readFile(markoPath, "utf8"));
      const twinPath = virtualPathFor(markoPath);
      twinFiles.set(twinPath, region);
      sourceRegions.set(twinPath, region);
    }
  }

  const components: ComponentEntry[] = [];
  const missingInput: string[] = [];

  // The twins and the generated project file only exist while the compiler is
  // reading them. Everything that creates them — the writes themselves, and the
  // API client that holds them open — lives inside the `try`, so a failure
  // part-way through the writes or in the client's own construction still hits
  // the `finally` and leaves no droppings behind.
  let api: API | undefined;
  try {
    await Promise.all([...twinFiles].map(([path, contents]) => writeFile(path, contents)));
    await writeFile(
      PROJECT_FILE,
      JSON.stringify(
        {
          compilerOptions: COMPILER_OPTIONS,
          include: ["ui/**/*.ts", "lib/**/*.ts"],
        },
        null,
        2,
      ) + "\n",
    );

    api = new API({ cwd: REGISTRY_DIR });
    const snapshot = api.updateSnapshot({ openProjects: [PROJECT_FILE] });
    const project = snapshot.getProjects()[0];
    if (!project) throw new Error(`no project loaded from ${PROJECT_FILE}`);
    const checker = project.checker;

    // Pass 2 — read each Input off the checker.
    for (const componentName of componentNames) {
      const componentDir = join(UI_DIR, componentName);
      const variantsFileName = join(componentDir, "variants.ts");
      const variantsKey = canonicalPath(variantsFileName);
      const variantMetadata = readVariantMetadata(variantsFileName, project);
      const parts: PartEntry[] = [];

      for (const fileName of componentFiles.get(componentName) ?? []) {
        const twinPath = virtualPathFor(join(componentDir, fileName));
        const twinKey = canonicalPath(twinPath);
        const sourceFile = project.program.getSourceFile(twinPath);
        const region = sourceRegions.get(twinPath) ?? "";
        if (!sourceFile) continue;

        const inputType = resolveInputType(checker, sourceFile);
        if (!inputType) {
          missingInput.push(`${componentName}/${fileName}`);
          continue;
        }

        const properties: PropertyEntry[] = [];
        let acceptsNativeAttributes = false;

        for (const property of checker.getPropertiesOfType(inputType)) {
          const kind = classifyProperty(property, twinKey, variantsKey);
          if (kind === "native") {
            acceptsNativeAttributes = true;
            continue; // ~370 per tag; summarized as `nativeAttributes` instead.
          }
          // A prop declared in BOTH the classifying source and the native tag
          // typing (`checkedChange` on a component, `onSelect`/`placeholder`/
          // `accept` on a machine) reads back through the checker as the
          // *intersection* of the two — an unreadable `(false & ((details: …)))`
          // soup carrying the native attribute's doc comment. The declaration
          // that decided the prop's kind is the authoritative one, so read type,
          // docs and optionality off that declaration alone.
          const authoritative = authoritativeDeclaration(
            property,
            kind,
            twinKey,
            variantsKey,
            project,
          );
          const declaration =
            authoritative ?? property.declarations[0]?.resolve(project) ?? sourceFile;
          const authoritativeSignature =
            authoritative && isPropertySignatureDeclaration(authoritative)
              ? (authoritative as any)
              : undefined;
          const propertyType =
            authoritativeSignature?.type
              ? checker.getTypeFromTypeNode(authoritativeSignature.type)
              : checker.getTypeOfSymbolAtLocation(property, declaration);
          const documentation = authoritative
            ? declarationDocumentation(authoritative)
            : checker.getDocumentationCommentOfSymbol(property);
          const entry: PropertyEntry = {
            name: property.name,
            type: propertyType
              ? checker.typeToString(propertyType, declaration, TYPE_FORMAT_FLAGS)
              : "unknown",
            // TS 7 renamed a property signature's `questionToken` to
            // `postfixToken`; the meaning is unchanged.
            required: authoritativeSignature
              ? authoritativeSignature.postfixToken === undefined
              : !(property.flags & SymbolFlags.Optional),
            kind,
          };
          if (documentation) entry.description = documentation;
          const variant = variantMetadata.get(property.name);
          if (kind === "variant" && variant) {
            entry.options = variant.options;
            if (variant.default !== undefined) entry.default = variant.default;
          }
          properties.push(entry);
        }

        properties.sort((a, b) => {
          if (a.required !== b.required) return a.required ? -1 : 1;
          return a.name.localeCompare(b.name);
        });

        const part: PartEntry = {
          file: fileName,
          name: basename(fileName, ".marko"),
          properties,
        };
        if (acceptsNativeAttributes) {
          part.nativeAttributes = findNativeTag(region) ?? "div";
        }
        const machineModule = findMachineModule(region);
        if (machineModule) part.machineModule = machineModule;
        parts.push(part);
      }

      // The root part is the file named after the component; its machine is the
      // component's machine.
      const rootPart = parts.find((part) => part.name === componentName) ?? parts[0];
      const entry: ComponentEntry = { name: componentName, parts };
      if (rootPart?.machineModule) entry.machineModule = rootPart.machineModule;
      components.push(entry);
    }
  } finally {
    api?.close();
    await Promise.all([...twinFiles.keys()].map((path) => rm(path, { force: true })));
    await rm(PROJECT_FILE, { force: true });
  }

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify({ generatedBy: "tooling/extract-api.ts", components }, null, 2) + "\n",
  );

  const partCount = components.reduce((total, component) => total + component.parts.length, 0);
  console.log(
    `api-reference: ${components.length} components, ${partCount} parts → ` +
      relative(process.cwd(), OUT_FILE),
  );
  if (missingInput.length) {
    console.warn(`no exported Input in ${missingInput.length} file(s):`);
    for (const file of missingInput) console.warn(`  ${file}`);
  }
}

/**
 * typescript@7's synchronous API talks to the compiler over a channel built on
 * Node's `stdout._handle.fd`, which Bun does not expose. The repo runs its
 * tooling with `bun`, so under Bun this re-executes the same file under `node`
 * and forwards the exit code; under Node it runs the extraction directly.
 */
async function main(): Promise<void> {
  const isBun = Boolean((globalThis as { Bun?: unknown }).Bun);
  if (!isBun) return extract();

  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    "node",
    ["--experimental-strip-types", new URL(import.meta.url).pathname],
    { stdio: "inherit", env: process.env },
  );
  if (result.error) throw result.error;
  process.exit(result.status ?? 1);
}

await main();
