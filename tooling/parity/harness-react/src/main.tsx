import { createRoot } from "react-dom/client"
import "./main.css"
import App from "./App.tsx"

// StrictMode is intentionally NOT wrapping App: several upstream demos
// (drawer, recharts' ResponsiveContainer) are sensitive to React 19's
// double-invoke-in-dev behavior in ways that would introduce flakiness
// into a deterministic screenshot pipeline. Production/preview builds are
// what the parity runner actually screenshots, where this has no effect
// anyway (StrictMode's extra invocation is dev-only).
createRoot(document.getElementById("root")!).render(<App />)
