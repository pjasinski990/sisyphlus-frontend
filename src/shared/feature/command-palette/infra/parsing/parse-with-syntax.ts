import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { ArgToken, tokenizeArgs } from './syntax-tokenizer';

export function parseWithSyntax(
    rest: string,
    syntax: CommandSyntax,
    cfg: PaletteConfig
): Record<string, unknown> {
    const tokens = tokenizeArgs(rest, syntax, cfg);

    const values: Record<string, unknown> = {};
    const positionals = syntax.positionals ?? [];

    // prefixes
    const prefixCfg = buildPrefixConfigMap(syntax);
    const prefBuckets = bucketPrefixedTokens(tokens);
    assignPrefixValues(values, prefixCfg, prefBuckets);

    // positionals
    const positionalValues = extractPositionals(tokens, positionals);
    Object.assign(values, positionalValues);

    return values;
}

function buildPrefixConfigMap(syntax: CommandSyntax): Map<string, { multi: boolean }> {
    const map = new Map<string, { multi: boolean }>();
    for (const p of syntax.prefixes ?? []) map.set(p.name, { multi: !!p.multi });
    return map;
}

function bucketPrefixedTokens(tokens: ArgToken[]): Map<string, string[]> {
    const buckets = new Map<string, string[]>();
    for (const t of tokens) {
        if (!isPrefixed(t)) continue;
        const bucket = buckets.get(t.name) ?? [];
        bucket.push(t.raw);
        buckets.set(t.name, bucket);
    }
    return buckets;
}

function isPrefixed(t: ArgToken): t is Extract<ArgToken, { kind: 'prefixed' }> {
    return t.kind === 'prefixed';
}

function assignPrefixValues(
    out: Record<string, unknown>,
    prefixCfg: Map<string, { multi: boolean }>,
    buckets: Map<string, string[]>
): void {
    for (const [name, { multi }] of prefixCfg.entries()) {
        const arr = buckets.get(name) ?? [];
        out[name] = multi ? arr : arr[0] ?? undefined;
    }
}

function extractPositionals(
    tokens: ArgToken[],
    positionals: NonNullable<CommandSyntax['positionals']>
): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    let i = 0;

    for (const spec of positionals) {
        i = skipPrefixed(tokens, i);

        if (spec.rest) {
            const { text, next } = takeRestWords(tokens, i);
            out[spec.name] = text.length ? text : undefined;
            i = next;
            continue;
        }

        const { value, next } = takeSingleWord(tokens, i);
        out[spec.name] = value;
        i = next;
    }
    return out;
}

function skipPrefixed(tokens: ArgToken[], idx: number): number {
    while (idx < tokens.length && isPrefixed(tokens[idx]!)) idx++;
    return idx;
}

function takeRestWords(tokens: ArgToken[], idx: number): { text: string; next: number } {
    const parts: string[] = [];
    let i = idx;
    while (i < tokens.length && isWord(tokens[i]!)) {
        parts.push((tokens[i]! as Extract<ArgToken, { kind: 'word' }>).value);
        i++;
    }
    return { text: parts.join(' ').trim(), next: i };
}

function takeSingleWord(tokens: ArgToken[], idx: number): { value: string | undefined; next: number } {
    if (idx < tokens.length && isWord(tokens[idx]!)) {
        return { value: tokens[idx]!.value, next: idx + 1 };
    }
    return { value: undefined, next: idx };
}

function isWord(t: ArgToken): t is Extract<ArgToken, { kind: 'word' }> {
    return t.kind === 'word';
}
