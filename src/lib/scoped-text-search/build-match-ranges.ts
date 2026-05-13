function collectTextNodes(root: HTMLElement): Text[] {
    const out: Text[] = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
            const t = node as Text;
            if (!t.data || t.data.length === 0) return NodeFilter.FILTER_REJECT;
            const p = t.parentElement;
            if (!p) return NodeFilter.FILTER_REJECT;
            if (p.closest("script, style, textarea, [data-scoped-text-search-ignore]")) {
                return NodeFilter.FILTER_REJECT;
            }
            return NodeFilter.FILTER_ACCEPT;
        },
    });
    let cur: Node | null;
    while ((cur = walker.nextNode())) {
        out.push(cur as Text);
    }
    return out;
}

export function buildMatchRanges(root: HTMLElement, query: string, caseSensitive: boolean): Range[] {
    const q = query.trim();
    if (q.length === 0) return [];

    const nodes = collectTextNodes(root);
    const map: { node: Text; offset: number }[] = [];
    let flat = "";
    for (const node of nodes) {
        const data = node.data;
        for (let i = 0; i < data.length; i++) {
            map.push({ node, offset: i });
            flat += caseSensitive ? data[i]! : data[i]!.toLowerCase();
        }
    }

    const needle = caseSensitive ? q : q.toLowerCase();
    const ranges: Range[] = [];
    let from = 0;
    while (from <= flat.length - needle.length) {
        const idx = flat.indexOf(needle, from);
        if (idx < 0) break;
        const endExclusive = idx + needle.length;
        const startM = map[idx]!;
        const endM = map[endExclusive - 1]!;
        const r = document.createRange();
        r.setStart(startM.node, startM.offset);
        r.setEnd(endM.node, endM.offset + 1);
        ranges.push(r);
        from = idx + 1;
    }
    return ranges;
}
