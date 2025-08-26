import { Block } from '@/feature/day-plan/entity/block';
import { DateTime } from 'luxon';

// TODO this or time-utils iso range should be gone
export function getBlockRenderMetrics(block: Block, hourSpan: { from: number; to: number }) {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const start = DateTime.fromISO(block.startUtc, { zone: 'utc' }).setZone(zone);
    const end   = DateTime.fromISO(block.endUtc, { zone: 'utc' }).setZone(zone);

    const totalMin   = (hourSpan.to - hourSpan.from) * 60;
    const spanStartM = hourSpan.from * 60;

    const topMin    = start.hour * 60 + start.minute - spanStartM;
    const heightMin = end.diff(start, 'minutes').minutes;

    return {
        topPct: (topMin / totalMin) * 100,
        heightPct: (heightMin / totalMin) * 100,
        labelFrom: start.toFormat('HH:mm'),
        labelTo:   end.toFormat('HH:mm'),
    };
}
