/**
 * "Did you mean ...?" candidates for an unknown registry name.
 *
 * A typo (`buton`, `dialoge`, `selct`) is one of the most common ways an
 * agent or a human drives the CLI into a failure. A bare
 * `Registry item "buton" was not found.` leaves the caller to guess; naming
 * the two closest registry entries turns the failure into a retry.
 *
 * Deliberately dependency-free and pure: a full Levenshtein over an ~86-entry
 * index is trivial, and a pure function is directly testable without a
 * network.
 */

/**
 * Classic two-row Levenshtein. O(a·b) time, O(min) space — the index is
 * small enough that clarity beats a more clever algorithm.
 */
export function editDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  let current = new Array<number>(b.length + 1)

  for (let i = 1; i <= a.length; i++) {
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      current[j] = Math.min(
        current[j - 1] + 1, // insertion
        previous[j] + 1, // deletion
        substitution // substitution
      )
    }
    const swap = previous
    previous = current
    current = swap
  }

  return previous[b.length]
}

/**
 * The closest `candidates` to `query`, best first.
 *
 * A candidate qualifies when it is within an edit-distance threshold of the
 * query, or when it contains the query as a substring (`button-group` for
 * `button`). The substring case matters: those are real registry names whose
 * distance is large purely because the query is short, and dropping them
 * would hide the most obvious completion.
 *
 * Ranking, highest first: prefix matches, then substring matches, then edit
 * distance, with ties broken alphabetically so the output is deterministic.
 * Exact (case-insensitive) matches are skipped — callers only reach here for
 * names that are genuinely absent.
 */
export function closestNames(
  query: string,
  candidates: Iterable<string>,
  limit = 3
): string[] {
  const needle = query.trim().toLowerCase()
  if (!needle || limit <= 0) {
    return []
  }

  // A short query matches almost everything at distance 1 ("c" is one edit
  // from every short name), so cap the threshold relative to its length.
  const maxDistance = Math.max(1, Math.ceil(needle.length * 0.4))

  const scored: { name: string; score: number }[] = []
  for (const candidate of candidates) {
    const haystack = candidate.toLowerCase()
    if (haystack === needle) continue

    const distance = editDistance(needle, haystack)
    const isPrefix = haystack.startsWith(needle)
    const isSubstring = haystack.includes(needle)
    if (!isSubstring && distance > maxDistance) continue

    let score = -distance
    if (isPrefix) score += 1000
    if (isSubstring) score += 500

    scored.push({ name: candidate, score })
  }

  scored.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
  return scored.slice(0, limit).map((entry) => entry.name)
}

/**
 * `Did you mean "button", "button-group"?` — the phrasing used in both the
 * human suggestion line and the JSON `error.suggestion`. Returns undefined
 * when there is nothing to suggest, so callers can omit the field entirely
 * rather than print an empty question.
 */
export function formatDidYouMean(names: string[]): string | undefined {
  if (!names.length) return undefined
  const quoted = names.map((name) => `"${name}"`)
  const list =
    quoted.length === 1
      ? quoted[0]
      : `${quoted.slice(0, -1).join(", ")} or ${quoted[quoted.length - 1]}`
  return `Did you mean ${list}?`
}