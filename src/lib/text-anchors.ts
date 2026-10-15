// Text anchors for "comment on a selection" (Google-Docs-style highlights). Carbon
// ships no annotation component, so this composes two browser standards:
//   • the Selection API — turn what the reviewer selected into a saved ANCHOR, and
//   • the CSS Custom Highlight API — paint saved passages WITHOUT touching the DOM
//     (no <mark> wrappers, so the record's own rendering / edit bindings are untouched).
//
// An anchor survives re-renders and light edits the way annotation tools do it
// (cf. W3C TextQuoteSelector): it stores WHICH record item the text came from (the
// item's data-edit-scope key), the exact QUOTE, and a little PREFIX/SUFFIX context.
// Re-finding = search the item's text for the quote, preferring the occurrence whose
// surrounding text matches. If the quote is gone (the passage was edited), it's
// reported as not found — the comment keeps its quote, just without a highlight.

export interface TextAnchor {
  /** The record item (data-edit-scope key) the passage lives in; null = whole root. */
  item: string | null;
  quote: string;
  prefix: string;
  suffix: string;
}

const CONTEXT = 32;
const MAX_QUOTE = 500;

/** Text nodes under `el`, in document order, with their running start offsets. */
const textIndex = (el: Element) => {
  const nodes: { node: Text; start: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let n: Node | null;
  while ((n = walker.nextNode())) {
    nodes.push({ node: n as Text, start: pos });
    pos += (n as Text).data.length;
  }
  return { nodes, text: nodes.map((x) => x.node.data).join('') };
};

/** The item container for a node: its nearest [data-edit-scope], else the root. */
const itemFor = (node: Node, root: Element) => {
  const el = node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;
  const scope = el?.closest('[data-edit-scope]');
  return scope && root.contains(scope) ? scope : root;
};

/** Build an anchor from a live selection inside `root`, or null if there's nothing
 *  usable (collapsed, empty, or outside the root). */
export function anchorFromSelection(sel: Selection | null, root: Element): TextAnchor | null {
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.commonAncestorContainer)) return null;
  const raw = range.toString();
  const quote = raw.trim().slice(0, MAX_QUOTE);
  if (!quote) return null;

  const container = itemFor(range.commonAncestorContainer, root);
  const { text } = textIndex(container);
  // Offset of the selection start within the item's text: the length of the text
  // from the item's start up to the selection start (Range.toString concatenates
  // text-node data in the same order as textIndex).
  const pre = document.createRange();
  pre.selectNodeContents(container);
  pre.setEnd(range.startContainer, range.startOffset);
  const start = pre.toString().length + (raw.length - raw.trimStart().length);
  const end = start + quote.length;
  return {
    item: container === root ? null : container.getAttribute('data-edit-scope'),
    quote,
    prefix: text.slice(Math.max(0, start - CONTEXT), start),
    suffix: text.slice(end, end + CONTEXT),
  };
}

/** Re-find an anchor's passage under `root`; null when the quote is no longer there. */
export function findAnchor(anchor: TextAnchor, root: Element): Range | null {
  const container = (anchor.item && root.querySelector(`[data-edit-scope="${CSS.escape(anchor.item)}"]`)) || root;
  const { nodes, text } = textIndex(container);
  if (!anchor.quote || !nodes.length) return null;

  // Every occurrence of the quote, scored by how much of the saved context matches.
  const tailMatch = (a: string, b: string) => { let k = 0; while (k < a.length && k < b.length && a[a.length - 1 - k] === b[b.length - 1 - k]) k++; return k; };
  const headMatch = (a: string, b: string) => { let k = 0; while (k < a.length && k < b.length && a[k] === b[k]) k++; return k; };
  let best = -1;
  let bestScore = -1;
  for (let at = text.indexOf(anchor.quote); at !== -1; at = text.indexOf(anchor.quote, at + 1)) {
    const score = tailMatch(text.slice(0, at), anchor.prefix) + headMatch(text.slice(at + anchor.quote.length), anchor.suffix);
    if (score > bestScore) { best = at; bestScore = score; }
  }
  if (best === -1) return null;

  // Map text offsets back to (text node, offset) pairs.
  const locate = (offset: number, preferNext: boolean) => {
    for (let i = 0; i < nodes.length; i++) {
      const { node, start } = nodes[i];
      const endPos = start + node.data.length;
      if (offset < endPos || (offset === endPos && !preferNext) || i === nodes.length - 1) {
        return { node, offset: Math.min(offset - start, node.data.length) };
      }
    }
    return null;
  };
  const a = locate(best, true);
  const b = locate(best + anchor.quote.length, false);
  if (!a || !b) return null;
  const r = document.createRange();
  r.setStart(a.node, a.offset);
  r.setEnd(b.node, b.offset);
  return r;
}

/** Whether the browser can paint highlights (CSS Custom Highlight API). */
export const canHighlight = () => typeof CSS !== 'undefined' && 'highlights' in CSS && typeof (window as any).Highlight === 'function';

/** Paint ranges in LAYERS so overlaps stay visible. One Highlight merges its own
 *  overlapping ranges into a single flat area, so passages that overlap (one comment
 *  inside another) are spread across `${prefix}-0 … -(layers-1)`: no two overlapping
 *  ranges share a layer. Each layer is styled with a TRANSLUCENT color, so where
 *  passages overlap the layers stack and the text reads darker. */
export function paintLayered(prefix: string, ranges: Range[], layers = 4) {
  if (!canHighlight()) return;
  const sorted = [...ranges].sort((a, b) => a.compareBoundaryPoints(Range.START_TO_START, b));
  const buckets: Range[][] = Array.from({ length: layers }, () => []);
  for (const r of sorted) {
    // First layer whose last range ends at or before this one starts; else the top.
    let placed = false;
    for (const b of buckets) {
      const last = b[b.length - 1];
      // r.start vs last.end: END_TO_START compares the source's END with this range's
      // START; >= 0 means r starts at/after last ends — no overlap.
      if (!last || r.compareBoundaryPoints(Range.END_TO_START, last) >= 0) { b.push(r); placed = true; break; }
    }
    if (!placed) buckets[layers - 1].push(r);
  }
  buckets.forEach((b, i) => paintHighlight(`${prefix}-${i}`, b));
}

/** Paint (or clear, with no ranges) a named highlight. */
export function paintHighlight(name: string, ranges: Range[]) {
  if (!canHighlight()) return;
  const reg = (CSS as any).highlights as Map<string, unknown>;
  if (!ranges.length) { reg.delete(name); return; }
  reg.set(name, new (window as any).Highlight(...ranges));
}
