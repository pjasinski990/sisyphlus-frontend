export type Token =
    | { kind: 'alias'; value: string }
    | { kind: 'prefixed'; prefix: string; value: string }
    | { kind: 'word'; value: string };

export function tokenizeSlashLine(input: string): Token[] {
    const s = input.trim();
    if (!s.startsWith('/')) return [];
    let i = 1;
    const out: Token[] = [];

    const pushWord = (w: string) => { if (w.length) out.push({ kind: 'word', value: w }); };
    const readOne = (): string => s[i++] ?? '';

    let alias = '';
    while (i < s.length && !/\s/.test(s[i])) alias += readOne();
    if (!alias) return [];
    out.push({ kind: 'alias', value: alias });

    while (i < s.length && /\s/.test(s[i])) i++;

    const quoteRx = /['"]/;
    while (i < s.length) {
        const ch = s[i];
        if (/\s/.test(ch)) { i++; continue; }

        if (ch === '@' || ch === '#' || ch === '!' || ch === '+') {
            const prefix = ch; i++;
            if (i >= s.length) break;
            let val = '';
            if (quoteRx.test(s[i])) {
                const q = s[i]; i++;
                while (i < s.length && s[i] !== q) val += readOne();
                if (s[i] === q) i++;
            } else {
                while (i < s.length && !/\s/.test(s[i])) val += readOne();
            }
            if (val.length) out.push({ kind: 'prefixed', prefix, value: val });
            continue;
        }

        if (quoteRx.test(ch)) {
            const q = ch; i++;
            let w = '';
            while (i < s.length && s[i] !== q) w += readOne();
            if (s[i] === q) i++;
            pushWord(w);
        } else {
            let w = '';
            while (i < s.length && !/\s/.test(s[i])) w += readOne();
            pushWord(w);
        }
    }
    return out;
}
