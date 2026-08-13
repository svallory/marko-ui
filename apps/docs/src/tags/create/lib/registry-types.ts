// Minimal local stand-in for shadcn's `shadcn/schema` RegistryItem type
// (originally `import { type RegistryItem } from "shadcn/schema"`, a zod
// schema from the shadcn CLI package that isn't a dependency of this app).
// Only the fields actually used across the ported create/ subsystem
// (utils.ts's groupItemsByType, merge-theme.ts's buildTheme, action-menu,
// item-explorer) are declared here.
export type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files?: unknown[];
  cssVars?: {
    theme?: Record<string, string>;
    light?: Record<string, string>;
    dark?: Record<string, string>;
  };
  meta?: Record<string, unknown>;
};
