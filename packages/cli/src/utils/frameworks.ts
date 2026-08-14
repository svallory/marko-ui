import { MARKO_UI_URL } from "@/src/registry/constants"

export const FRAMEWORKS = {
  "marko-run": {
    name: "marko-run",
    label: "Marko Run",
    links: {
      installation: `${MARKO_UI_URL}/docs/installation`,
      tailwind: "https://tailwindcss.com/docs/installation/using-vite",
    },
  },
  "marko-vite": {
    name: "marko-vite",
    label: "Marko + Vite",
    links: {
      installation: `${MARKO_UI_URL}/docs/installation`,
      tailwind: "https://tailwindcss.com/docs/installation/using-vite",
    },
  },
  manual: {
    name: "manual",
    label: "Manual",
    links: {
      installation: `${MARKO_UI_URL}/docs/installation`,
      tailwind: "https://tailwindcss.com/docs/installation",
    },
  },
} as const

export type Framework = (typeof FRAMEWORKS)[keyof typeof FRAMEWORKS]
