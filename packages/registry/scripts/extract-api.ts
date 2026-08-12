/**
 * Extracts the public API surface of every registry component into one
 * checked-in artifact: apps/docs/src/lib/api-reference.json.
 *
 * Run: bun packages/registry/scripts/extract-api.ts   (script: `extract:api`)
 *
 * How it works
 * ------------
 * `.marko` files cannot be fed to `tsc`. But every component in this registry
 * keeps its entire TypeScript region — imports, helper interfaces, and the
 * `export type Input` / `export interface Input` declaration — above the first
 * line-initial `<` tag. That leading slice IS valid standalone TypeScript, so
 * the script carves it out into a *virtual* `.ts` file sitting at the
 * component's own path (so relative imports like `./variants.ts` and the
 * `#lib/*` subpath still resolve) and hands the whole set to one
 * `ts.createProgram` backed by a compiler host that serves those virtual
 * files from memory.
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
 */
import ts from "typescript";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname, basename, relative } from "node:path";

const ROOT = new URL("../", import.meta.url).pathname;
const REGISTRY_DIR = ROOT;
const UI_DIR = join(ROOT, "default", "ui");
const OUT_FILE = join(ROOT, "../../apps/docs/src/lib/api-reference.json");

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

/** Where the virtual `.ts` twin of a `.marko` file lives (same directory). */
function virtualPathFor(markoPath: string): string {
  return join(dirname(markoPath), `__api__${basename(markoPath, ".marko")}.ts`);
}

const COMPILER_OPTIONS: ts.CompilerOptions = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  strict: true,
  skipLibCheck: true,
  types: ["marko", "node"],
  allowImportingTsExtensions: true,
  noEmit: true,
  baseUrl: REGISTRY_DIR,
  paths: { "#lib/*": ["./default/lib/*"] },
};

/**
 * A normal compiler host with the virtual `.ts` files layered on top, so the
 * program sees them as if they existed on disk next to their `.marko` source.
 */
function createVirtualHost(virtualFiles: Map<string, string>): ts.CompilerHost {
  const host = ts.createCompilerHost(COMPILER_OPTIONS, true);
  const readRealFile = host.readFile.bind(host);
  const realFileExists = host.fileExists.bind(host);
  const getRealSourceFile = host.getSourceFile.bind(host);

  host.readFile = (fileName) => virtualFiles.get(fileName) ?? readRealFile(fileName);
  host.fileExists = (fileName) => virtualFiles.has(fileName) || realFileExists(fileName);
  host.getSourceFile = (fileName, languageVersion, onError, shouldCreate) => {
    const virtual = virtualFiles.get(fileName);
    if (virtual === undefined) {
      return getRealSourceFile(fileName, languageVersion, onError, shouldCreate);
    }
    return ts.createSourceFile(fileName, virtual, languageVersion, true, ts.ScriptKind.TS);
  };
  return host;
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
 * Resolves the `Input` export to a concrete type. Generic `Input<T = …>`
 * declarations (carousel, data-table, marquee, listbox…) are instantiated with
 * each parameter's own default so the property list is the one a caller sees
 * when writing the tag without explicit type arguments.
 */
function resolveInputType(
  checker: ts.TypeChecker,
  sourceFile: ts.SourceFile,
): ts.Type | undefined {
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) return undefined;
  const inputSymbol = checker
    .getExportsOfModule(moduleSymbol)
    .find((exported) => exported.getName() === "Input");
  if (!inputSymbol) return undefined;

  const declaredType = checker.getDeclaredTypeOfSymbol(inputSymbol);
  const typeParameters = (declaredType as ts.InterfaceType).typeParameters;
  if (!typeParameters?.length) return declaredType;

  // Instantiate with defaults where declared, `unknown` otherwise. Without
  // this, an uninstantiated generic reports no properties at all.
  const typeArguments = typeParameters.map(
    (parameter) => checker.getDefaultFromTypeParameter(parameter) ?? checker.getAnyType(),
  );
  const declaration = inputSymbol.declarations?.[0];
  if (declaration && ts.isTypeAliasDeclaration(declaration)) {
    const instantiated = (checker as unknown as {
      getTypeAliasInstantiation?: (symbol: ts.Symbol, args: readonly ts.Type[]) => ts.Type;
    }).getTypeAliasInstantiation?.(inputSymbol, typeArguments);
    if (instantiated) return instantiated;
  }
  const reference = (checker as unknown as {
    createTypeReference?: (target: ts.GenericType, args: readonly ts.Type[]) => ts.Type;
  }).createTypeReference?.(declaredType as ts.GenericType, typeArguments);
  return reference ?? declaredType;
}

function classifyProperty(
  property: ts.Symbol,
  ownFileName: string,
  variantsFileName: string,
): PropertyKind {
  const declarationFiles = (property.declarations ?? []).map((declaration) =>
    declaration.getSourceFile().fileName,
  );
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
  property: ts.Symbol,
  kind: PropertyKind,
  ownFileName: string,
  variantsFileName: string,
): ts.Declaration | undefined {
  const matches = (test: (fileName: string) => boolean) =>
    property.declarations?.find((declaration) => test(declaration.getSourceFile().fileName));
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
}

/** The plain-text JSDoc body attached directly to one declaration. */
function declarationDocumentation(declaration: ts.Declaration): string {
  const comments = ts
    .getJSDocCommentsAndTags(declaration)
    .flatMap((node) => {
      const comment = (node as ts.JSDoc).comment;
      return typeof comment === "string" ? [comment] : [];
    });
  return comments.join("\n").trim();
}

/**
 * Reads the cva `variants` block out of a component's `variants.ts` so the
 * docs can list a variant's actual options and its `defaultVariants` value —
 * neither of which is recoverable from `VariantProps`, whose type is just a
 * union of string literals with no notion of which one is the default.
 */
async function readVariantMetadata(
  variantsFileName: string,
): Promise<Map<string, { options: string[]; default?: string }>> {
  const metadata = new Map<string, { options: string[]; default?: string }>();
  if (!existsSync(variantsFileName)) return metadata;

  const source = ts.createSourceFile(
    variantsFileName,
    await readFile(variantsFileName, "utf8"),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TS,
  );

  const objectLiteralProperty = (
    object: ts.ObjectLiteralExpression,
    name: string,
  ): ts.Expression | undefined => {
    for (const member of object.properties) {
      if (!ts.isPropertyAssignment(member)) continue;
      const memberName = ts.isIdentifier(member.name)
        ? member.name.text
        : ts.isStringLiteral(member.name)
          ? member.name.text
          : undefined;
      if (memberName === name) return member.initializer;
    }
    return undefined;
  };

  const visit = (node: ts.Node): void => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "cva"
    ) {
      const config = node.arguments[1];
      if (config && ts.isObjectLiteralExpression(config)) {
        const variants = objectLiteralProperty(config, "variants");
        const defaults = objectLiteralProperty(config, "defaultVariants");
        if (variants && ts.isObjectLiteralExpression(variants)) {
          for (const group of variants.properties) {
            if (!ts.isPropertyAssignment(group)) continue;
            const groupName = ts.isIdentifier(group.name)
              ? group.name.text
              : ts.isStringLiteral(group.name)
                ? group.name.text
                : undefined;
            if (!groupName || !ts.isObjectLiteralExpression(group.initializer)) continue;
            const options = group.initializer.properties.flatMap((option) => {
              if (!ts.isPropertyAssignment(option)) return [];
              if (ts.isIdentifier(option.name) || ts.isStringLiteral(option.name)) {
                return [option.name.text];
              }
              return [];
            });
            let defaultOption: string | undefined;
            if (defaults && ts.isObjectLiteralExpression(defaults)) {
              const value = objectLiteralProperty(defaults, groupName);
              if (value && ts.isStringLiteral(value)) defaultOption = value.text;
            }
            metadata.set(groupName, { options, default: defaultOption });
          }
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return metadata;
}

async function main() {
  const componentNames = (await readdir(UI_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  // Pass 1 — carve every .marko file's TypeScript region into a virtual .ts
  // twin, and build ONE program over all of them. One program means the
  // checker resolves cross-component and node_modules types once instead of
  // 139 times; a per-file program takes minutes, this takes seconds.
  const virtualFiles = new Map<string, string>();
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
      const virtualPath = virtualPathFor(markoPath);
      virtualFiles.set(virtualPath, region);
      sourceRegions.set(virtualPath, region);
    }
  }

  const host = createVirtualHost(virtualFiles);
  const program = ts.createProgram([...virtualFiles.keys()], COMPILER_OPTIONS, host);
  const checker = program.getTypeChecker();

  // Pass 2 — read each Input off the checker.
  const components: ComponentEntry[] = [];
  const missingInput: string[] = [];

  for (const componentName of componentNames) {
    const componentDir = join(UI_DIR, componentName);
    const variantsFileName = join(componentDir, "variants.ts");
    const variantMetadata = await readVariantMetadata(variantsFileName);
    const parts: PartEntry[] = [];

    for (const fileName of componentFiles.get(componentName) ?? []) {
      const virtualPath = virtualPathFor(join(componentDir, fileName));
      const sourceFile = program.getSourceFile(virtualPath);
      const region = sourceRegions.get(virtualPath) ?? "";
      if (!sourceFile) continue;

      const inputType = resolveInputType(checker, sourceFile);
      if (!inputType) {
        missingInput.push(`${componentName}/${fileName}`);
        continue;
      }

      const properties: PropertyEntry[] = [];
      let acceptsNativeAttributes = false;

      for (const property of checker.getPropertiesOfType(inputType)) {
        const kind = classifyProperty(property, virtualPath, variantsFileName);
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
        const authoritative = authoritativeDeclaration(property, kind, virtualPath, variantsFileName);
        const declaration = authoritative ?? property.declarations?.[0] ?? sourceFile;
        const propertyType =
          authoritative && ts.isPropertySignature(authoritative) && authoritative.type
            ? checker.getTypeFromTypeNode(authoritative.type)
            : checker.getTypeOfSymbolAtLocation(property, declaration);
        const documentation = authoritative
          ? declarationDocumentation(authoritative)
          : ts.displayPartsToString(property.getDocumentationComment(checker));
        const entry: PropertyEntry = {
          name: property.getName(),
          type: checker.typeToString(
            propertyType,
            declaration,
            ts.TypeFormatFlags.NoTruncation | ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType,
          ),
          required:
            authoritative && ts.isPropertySignature(authoritative)
              ? authoritative.questionToken === undefined
              : !(property.flags & ts.SymbolFlags.Optional),
          kind,
        };
        if (documentation) entry.description = documentation;
        const variant = variantMetadata.get(property.getName());
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

  await mkdir(dirname(OUT_FILE), { recursive: true });
  await writeFile(
    OUT_FILE,
    JSON.stringify(
      { generatedBy: "packages/registry/scripts/extract-api.ts", components },
      null,
      2,
    ) + "\n",
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

await main();
