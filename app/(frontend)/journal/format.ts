const dateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Africa/Lagos",
});

/** "21 October 2026" */
export function formatPostDate(iso: string): string {
  return dateFormat.format(new Date(iso));
}

type LexicalNode = { text?: string; children?: LexicalNode[] };

/** Rough reading time from Lexical rich text, at ~220 words per minute. */
export function readingMinutes(content: unknown): number {
  let words = 0;
  const walk = (node: LexicalNode | undefined) => {
    if (!node) return;
    if (typeof node.text === "string") words += node.text.trim().split(/\s+/).filter(Boolean).length;
    node.children?.forEach(walk);
  };
  walk((content as { root?: LexicalNode } | null)?.root);
  return Math.max(1, Math.round(words / 220));
}
