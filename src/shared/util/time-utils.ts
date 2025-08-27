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

export function hhmmToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
    const hh = Number.isFinite(h) ? h : 0;
    const mm = Number.isFinite(m) ? m : 0;
    return hh * 60 + mm;
}

export function minutesToHHmm(total: number): string {
    const t = Math.max(0, Math.round(total));
    const h = Math.floor(t / 60);
    const m = t % 60;
    const hs = String(h).padStart(2, '0');
    const ms = String(m).padStart(2, '0');
    return `${hs}:${ms}`;
}

export function minutesToIso(value: number, minimum: number): string {
    const m = Math.max(minimum, Math.round(value));
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0 && mm > 0) return `PT${h}H${mm}M`;
    if (h > 0) return `PT${h}H`;
    return `PT${mm}M`;
}
