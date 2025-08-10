import React from 'react';
import { Range } from '@/shared/feature/util/range';
import { clamp } from '@/shared/feature/util/clamp';
import { TimeOfDay } from '@/shared/feature/timeline/entity/task';

export const TaskBlock: React.FC<{
    timespan: Range<TimeOfDay>;
    title: string;
    timelineStartHour: number;
    timelineTotalMin: number;
}> = ({ timespan, title, timelineStartHour, timelineTotalMin }) => {
    const topMin = toMinutesFromStart(timespan.from, timelineStartHour, timelineTotalMin);
    const bottomMin = timelineTotalMin - toMinutesFromStart(timespan.to, timelineStartHour, timelineTotalMin);

    return (
        <div
            className='absolute rounded-lg border border-ink-5 bg-surface-3/70 backdrop-blur-[2px] px-3 py-2 hover:bg-surface-3'
            style={{
                top: `${(topMin / timelineTotalMin) * 100}%`,
                bottom: `${(bottomMin / timelineTotalMin) * 100}%`,
            }}
        >
            <div className='text-sm font-medium'>{title}</div>
            <div className='text-xs text-ink-4'>
                {timespan.from}–{timespan.to}
            </div>
        </div>
    );
};

const toMinutesFromStart = (hhmm: TimeOfDay, startHour: number, totalMin: number) => {
    const [h, m] = hhmm.split(':').map(Number);
    return clamp(h * 60 + m - startHour * 60, 0, totalMin);
};
