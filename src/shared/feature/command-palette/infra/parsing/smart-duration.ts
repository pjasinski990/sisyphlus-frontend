const WORD_NUM: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6,
    seven: 7, eight: 8, nine: 9, ten: 10, half: 0.5,
};

export function parseDurationToMinutes(input: string): number | null {
    const s = input.trim().toLowerCase();
    if (!s) return null;

    let m = s.match(/^(\d+)\s*(m|min|mins|minute|minutes)$/);
    if (m) return parseInt(m[1]!, 10);

    m = s.match(/^(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)$/);
    if (m) return Math.round(parseFloat(m[1]!) * 60);

    m = s.match(/^(\d+(?:\.\d+)?)h(?:(\d{1,2})m)?$/);
    if (m) {
        const h = parseFloat(m[1]!);
        const mm = m[2] ? parseInt(m[2]!, 10) : 0;
        return Math.round(h * 60 + mm);
    }

    const words = s.split(/\s+/);
    let minutes = 0;
    for (let i = 0; i < words.length; i++) {
        const w = words[i]!;
        if (w in WORD_NUM) {
            const n = WORD_NUM[w];
            const next = (words[i+1] ?? '');
            if (next.startsWith('hour')) { minutes += Math.round(n * 60); i++; continue; }
            if (next.startsWith('min'))  { minutes += Math.round(n);      i++; continue; }
            continue;
        }
        if (w === 'a' || w === 'an') {
            const next = (words[i+1] ?? '');
            if (next.startsWith('hour')) { minutes += 60; i++; continue; }
            if (next.startsWith('min'))  { minutes += 1;  i++; continue; }
            continue;
        }
        if (w === 'half') {
            const next = (words[i+1] ?? '');
            if (next === 'an' && (words[i+2] ?? '').startsWith('hour')) { minutes += 30; i += 2; continue; }
            if (next.startsWith('hour')) { minutes += 30; i++; }
        }
    }
    return minutes > 0 ? minutes : null;
}
