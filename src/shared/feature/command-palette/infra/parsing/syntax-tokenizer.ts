import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { CommandSyntax, HeadMatcher } from '@/shared/feature/command-palette/entity/syntax';

export type ArgToken =
    | { kind: 'word'; value: string }
    | { kind: 'prefixed'; name: string; raw: string };

function matchHead(src: string, pos: number, head: HeadMatcher): number | null {
    if (head.kind === 'literal') {
        return src.startsWith(head.literal, pos) ? pos + head.literal.length : null;
    }
    const m = head.regex.exec(src.slice(pos));
    return m && m.index === 0 ? pos + m[0].length : null;
}

function readQuotedOrBare(src: string, pos: number, cfg: PaletteConfig): { value: string; next: number } {
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
    while (i < src.length && !cfg.delimiter.test(src[i]!)) {
        out += src[i]!;
        i++;
    }
    return { value: out, next: i };
}

export function tokenizeArgs(rest: string, syntax: CommandSyntax, cfg: PaletteConfig): ArgToken[] {
    const tokens: ArgToken[] = [];
    const prefixes = syntax.prefixes ?? [];
    let i = 0;

    const skip = () => { while (i < rest.length && cfg.delimiter.test(rest[i]!)) i++; };

    while (i < rest.length) {
        skip();
        if (i >= rest.length) break;

        let consumed = false;
        for (const spec of prefixes) {
            const next = matchHead(rest, i, spec.head);
            if (next !== null) {
                const { value, next: after } = readQuotedOrBare(rest, next, cfg);
                tokens.push({ kind: 'prefixed', name: spec.name, raw: value });
                i = after;
                consumed = true;
                break;
            }
        }
        if (consumed) continue;

        const { value, next } = readQuotedOrBare(rest, i, cfg);
        if (value.length) tokens.push({ kind: 'word', value });
        i = next;
    }
    return tokens;
}
