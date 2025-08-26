export function normalizeHHmm(s: string): string {
    if (s.includes(':')) return s;
    if (s.length === 4) return `${s.slice(0, 2)}:${s.slice(2)}`;
    throw new Error('Bad time format');
}

export function parseIsoDurationMs(p: string): number {
    const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(p);
    if (!m) throw new Error('Bad ISO duration');
    const h = Number(m[1] ?? 0);
    const min = Number(m[2] ?? 0);
    const s = Number(m[3] ?? 0);
    return ((h * 60 + min) * 60 + s) * 1000;
}

export function buildUtcInstants(desc: {
    startLocalDate: string;
    startLocalTime: string;
    duration: string;
}) {
    const hhmm = normalizeHHmm(desc.startLocalTime);
    const startLocal = new Date(`${desc.startLocalDate}T${hhmm}:00`);
    const ms = parseIsoDurationMs(desc.duration);
    const endLocal = new Date(startLocal.getTime() + ms);

    return {
        startUtc: startLocal.toISOString(),
        endUtc: endLocal.toISOString(),
    };
}
