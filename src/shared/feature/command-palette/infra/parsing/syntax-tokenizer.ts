import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { CommandSyntax, HeadMatcher } from '@/shared/feature/command-palette/entity/syntax';

export type ArgToken =
    | { kind: 'word'; value: string }
    | { kind: 'prefixed'; name: string; raw: string };

type PrefixSpec = { name: string; head: HeadMatcher; rest?: boolean };

export function tokenizeArgs(rest: string, syntax: CommandSyntax, cfg: PaletteConfig): ArgToken[] {
    const tokens: ArgToken[] = [];
    const prefixes: ReadonlyArray<PrefixSpec> = syntax.prefixes ?? [];
    let i = 0;

    while (i < rest.length) {
        i = skipDelimiters(rest, i, cfg);
        if (i >= rest.length) break;

        const pref = tryConsumeAnyPrefix(rest, i, prefixes, cfg);
        if (pref) {
            tokens.push(pref.token);
            i = pref.next;
            continue;
        }

        const { value, next } = readToken(rest, i, cfg, prefixes);
        if (value.length) tokens.push({ kind: 'word', value });
        i = next;
    }
    return tokens;
}

function skipDelimiters(src: string, pos: number, cfg: PaletteConfig): number {
    while (pos < src.length && isDelimiter(cfg, src[pos])) pos++;
    return pos;
}

function isDelimiter(cfg: PaletteConfig, ch: string | undefined): boolean {
    return !!ch && cfg.delimiter.test(ch);
}

function tryConsumeAnyPrefix(
    src: string,
    pos: number,
    prefixes: ReadonlyArray<PrefixSpec>,
    cfg: PaletteConfig
): { token: ArgToken; next: number } | null {
    for (const spec of prefixes) {
        const res = consumePrefixedToken(src, pos, spec, cfg, prefixes);
        if (res) return res;
    }
    return null;
}

function consumePrefixedToken(
    src: string,
    pos: number,
    spec: PrefixSpec,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<PrefixSpec>
): { token: ArgToken; next: number } | null {
    if (!isValidPrefixAt(src, pos, spec, cfg, prefixes)) return null;

    const afterHead = advanceIfHeadMatch(src, pos, spec.head)!;

    if (spec.rest) {
        const start = skipDelimiters(src, afterHead, cfg);
        if (start >= src.length || isDelimiter(cfg, src[start])) return null;
        const raw = src.slice(afterHead);
        return { token: { kind: 'prefixed', name: spec.name, raw }, next: src.length };
    }

    const start = skipDelimiters(src, afterHead, cfg);
    const { value, next } = readToken(src, start, cfg, prefixes);
    if (!value.length) return null;
    return { token: { kind: 'prefixed', name: spec.name, raw: value }, next };
}

function isValidPrefixAt(
    src: string,
    pos: number,
    spec: PrefixSpec,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<PrefixSpec>
): boolean {
    if (!isTokenBoundary(src, pos, cfg) && !(src[pos] === '\n' && isNewlineHead(spec.head))) return false;
    const afterHead = advanceIfHeadMatch(src, pos, spec.head);
    if (afterHead === null) return false;
    return hasNonEmptyValueAfterHead(src, afterHead, cfg, prefixes);
}

function isNewlineHead(head: HeadMatcher): boolean {
    if (head.kind !== 'regex') return false;
    head.regex.lastIndex = 0;
    const m = head.regex.exec('\n');
    return !!m && m.index === 0;
}

function advanceIfHeadMatch(src: string, pos: number, head: HeadMatcher): number | null {
    if (head.kind === 'literal') {
        return src.startsWith(head.literal, pos) ? pos + head.literal.length : null;
    }
    head.regex.lastIndex = 0;
    const m = head.regex.exec(src.slice(pos));
    return m && m.index === 0 ? pos + m[0].length : null;
}

function hasNonEmptyValueAfterHead(
    src: string,
    afterHead: number,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<PrefixSpec>,
): boolean {
    const i = skipDelimiters(src, afterHead, cfg);
    if (i >= src.length) return false;

    const ch = src[i];
    if (isQuote(cfg, ch)) return true;
    if (isDelimiter(cfg, ch)) return false;

    return !anyValidPrefixAt(src, i, prefixes, cfg);
}

function isTokenBoundary(src: string, pos: number, cfg: PaletteConfig): boolean {
    if (pos <= 0) return true;
    return isDelimiter(cfg, src[pos - 1]);
}

function readToken(
    src: string,
    pos: number,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<PrefixSpec>
): { value: string; next: number } {
    const ch = src[pos];
    if (isQuote(cfg, ch)) return readQuoted(src, pos, ch!);
    return readBare(src, pos, cfg, prefixes);
}

function isQuote(cfg: PaletteConfig, ch: string | undefined): boolean {
    return !!ch && cfg.quotes.includes(ch);
}

function readQuoted(src: string, pos: number, quote: string): { value: string; next: number } {
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

function readBare(
    src: string,
    pos: number,
    cfg: PaletteConfig,
    prefixes: ReadonlyArray<PrefixSpec>
): { value: string; next: number } {
    let i = pos;
    let out = '';
    while (i < src.length) {
        const ch = src[i]!;
        if (isDelimiter(cfg, ch)) break;
        if (anyValidPrefixAt(src, i, prefixes, cfg)) break;
        out += ch;
        i++;
    }
    return { value: out, next: i };
}

function anyValidPrefixAt(
    src: string,
    pos: number,
    prefixes: ReadonlyArray<PrefixSpec>,
    cfg: PaletteConfig
): boolean {
    for (const p of prefixes) {
        if (isValidPrefixAt(src, pos, p, cfg, prefixes)) return true;
    }
    return false;
}
