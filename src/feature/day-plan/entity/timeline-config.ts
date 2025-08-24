import { Range } from '@/shared/util/range';

export interface TimelineConfig {
    hourSpan: Range<number>;
    pixelsPerMinute: number;
    segmentMinutes: number;
}

export const timelineConfig: TimelineConfig = {
    hourSpan: {
        from: 0,
        to: 24,
    },
    pixelsPerMinute: 1.4,
    segmentMinutes: 15,
};
