import { Range } from '@/shared/util/range';

export interface DailyTimelineConfig {
    hourSpan: Range<number>;
    pixelsPerMinute: number;
    segmentMinutes: number;
}

export const timelineConfig: DailyTimelineConfig = {
    hourSpan: {
        from: 0,
        to: 24,
    },
    pixelsPerMinute: 1.2,
    segmentMinutes: 15,
};
