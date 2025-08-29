import { InputParser } from '@/shared/feature/command-palette/entity/input-parser';
import { parseDurationToMinutes } from '@/shared/feature/command-palette/infra/parsing/smart-duration';
import { nowLocalTime } from '@/shared/util/local-date-helper';

function parseTimeToHHmm(text: string): string | null {
    const s = text.trim().toLowerCase();
    if (!s) return null;
    if (s === 'now') return nowLocalTime();
    if (s === 'noon') return '12:00';
    if (s === 'midday') return '12:00';
    if (s === 'midnight') return '00:00';

    let m = s.match(/^(\d{1,2}):(\d{2})$/);
    if (m) {
        const hh = parseInt(m[1]!, 10);
        const mm = parseInt(m[2]!, 10);
        if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
        return null;
    }

    m = s.match(/^(\d{1,2})(?::?(\d{2}))?\s*(am|pm)$/);
    if (m) {
        let hh = parseInt(m[1]!, 10);
        const mm = m[2] ? parseInt(m[2]!, 10) : 0;
        const ap = m[3]!;
        if (hh === 12 && ap === 'am') hh = 0;
        else if (hh !== 12 && ap === 'pm') hh += 12;
        if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
        return null;
    }

    m = s.match(/^(\d{1,2})h(\d{2})$/);
    if (m) {
        const hh = parseInt(m[1]!, 10);
        const mm = parseInt(m[2]!, 10);
        if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
        return null;
    }

    m = s.match(/^(\d{1,2})\s*h(?:ours?)?$/);
    if (m) {
        const hh = parseInt(m[1]!, 10);
        if (hh >= 0 && hh <= 23) return `${String(hh).padStart(2,'0')}:00`;
        return null;
    }

    return null;
}

function extractTimeAndDuration(text: string): { time: string | null; durationMin: number | null } {
    const patterns = [
        /\b(?:now|noon|midday|midnight)\b/i,
        /\b\d{1,2}:\d{2}\b/,
        /\b\d{1,2}\s*(?:am|pm)\b/i,
        /\b\d{1,2}:\d{2}\s*(?:am|pm)\b/i,
        /\b\d{1,2}h\d{2}\b/i,
        /\b\d{1,2}\s*h(?:ours?)?\b/i,
    ];
    let match: RegExpMatchArray | null = null;
    let idx = -1;
    for (const rx of patterns) {
        const m = text.match(rx);
        if (m) { match = m; idx = m.index ?? -1; break; }
    }
    if (!match) {
        const dur = parseDurationToMinutes(text);
        return { time: null, durationMin: dur };
    }
    const timeText = match[0]!;
    const before = text.slice(0, idx).trim();
    const after = text.slice(idx + timeText.length).trim();
    const rest = [before, after].filter(Boolean).join(' ').trim();
    const time = parseTimeToHHmm(timeText);
    const dur = parseDurationToMinutes(rest) ?? parseDurationToMinutes(text.replace(timeText, '').trim());
    return { time, durationMin: dur };
}

function minutesToISODuration(min: number): string {
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `PT${h}H${m}M`;
    if (h > 0) return `PT${h}H`;
    return `PT${m}M`;
}

export const smartTimeOfDayParser: InputParser<{ startLocalTime: string; duration: string }> = {
    parse(text: string) {
        const { time, durationMin } = extractTimeAndDuration(text);
        if (!time && !durationMin) return { ok: false, error: 'Provide time and/or duration' };
        const out: { startLocalTime?: string; duration?: string } = {};
        if (time) out.startLocalTime = time;
        if (durationMin != null) out.duration = minutesToISODuration(durationMin);
        return { ok: true, value: out };
    }
};
