/**
 * next/font/google shim — calendar-hijri.tsx is the only example that
 * imports a Google font loader (`Vazirmatn`) this way; it's not one of
 * this harness's target demos, but Vite's production build traces the
 * whole examples/ directory (every basename is a routable demo), so the
 * import must still resolve. next/font's loaders return an object with a
 * `.className` (and `.style`/`.variable` for CSS-var mode); an empty
 * className is a faithful stand-in since actually loading Vazirmatn (an
 * Arabic-script font) would only affect the not-rendered Hijri calendar
 * demo's Arabic glyphs, never any of the button/drawer/accordion/item
 * demos this harness verifies.
 */
type FontLoader = (options?: unknown) => { className: string; style: Record<string, never>; variable: string }

const makeFontLoader: FontLoader = () => ({ className: "", style: {}, variable: "" })

export const Vazirmatn = makeFontLoader
