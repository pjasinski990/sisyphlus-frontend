import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { CommandSyntax, HeadMatcher } from '@/shared/feature/command-palette/entity/syntax';

export type ArgToken =
    | { kind: 'word'; value: string }
    | { kind: 'prefixed'; name: string; raw: string };

function matchHead(src: string, pos: number, head: HeadMatcher): number | null {
    if (head.kind === 'literal') {
        return src.startsWith(head.literal, pos) ? pos + head.literal.length : null;
    }
    head.regex.lastIndex = 0;
    const m = head.regex.exec(src.slice(pos));
    return m && m.index === 0 ? pos + m[0].length : null;
}

function readQuotedOrBare(
    src: string,
    pos: number,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<{ head: HeadMatcher }>
): { value: string; next: number } {
    const ch = src[pos] ?? '';
    if (cfg.quotes.includes(ch)) {
        const quote = ch;
        let i = pos + 1;
        let out = '';
        while (i < src.length) {
            const c = src[i]!;
            if (c === quote) return { value: out, next: i + 1 };
            out += c;
            i++;
        }
        return { value: out, next: i };
    }

    let i = pos;
    let out = '';
    while (i < src.length) {
        if (cfg.delimiter.test(src[i]!)) break;

        let startsPrefix = false;
        for (const spec of prefixes) {
            if (matchHead(src, i, spec.head) !== null) {
                startsPrefix = true;
                break;
            }
        }
        if (startsPrefix) break;

        out += src[i]!;
        i++;
    }
    return { value: out, next: i };
}

export function tokenizeArgs(rest: string, syntax: CommandSyntax, cfg: PaletteConfig): ArgToken[] {
    const tokens: ArgToken[] = [];
    const prefixes = syntax.prefixes ?? [];
    let i = 0;

    const isDelim = (ch: string) => cfg.delimiter.test(ch);

    while (i < rest.length) {
        let consumed = false;

        for (const spec of prefixes) {
            const next = matchHead(rest, i, spec.head);
            if (next !== null) {
                const read = (spec as any).rest
                    ? (s: string, p: number) => ({ value: s.slice(p), next: s.length })
                    : (s: string, p: number) => readQuotedOrBare(s, p, cfg, prefixes);
                const { value, next: after } = read(rest, next);
                tokens.push({ kind: 'prefixed', name: spec.name, raw: value });
                i = after;
                consumed = true;
                break;
            }
        }
        if (consumed) continue;

        if (isDelim(rest[i]!)) { i++; continue; }

        const { value, next } = readQuotedOrBare(rest, i, cfg, prefixes);
        if (value.length) tokens.push({ kind: 'word', value });
        i = next;
    }
    return tokens;
}
