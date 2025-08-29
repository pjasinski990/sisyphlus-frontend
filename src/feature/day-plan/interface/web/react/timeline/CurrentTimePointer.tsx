import React from 'react';
import { timelineConfig } from '@/feature/day-plan/entity/timeline-config';
import { nowLocalTime } from '@/shared/util/local-date-helper';

export const CurrentTimePointer: React.FC<{ progress: number; now: Date }> = ({ progress, now }) => {
    const { from: startHour, to: endHour } = timelineConfig.hourSpan;
    const nowDecimal = now.getHours() + now.getMinutes() / 60;
    const outOfRange = nowDecimal < startHour || nowDecimal > endHour;

    return (
        <div
            className='absolute inset-0 pointer-events-none z-10'
            style={{ top: `${progress}%` }}
            aria-label={`Current time: ${nowLocalTime()}`}
        >
            <div className='relative'>
                <div
                    className={[
                        'h-[1px] w-full',
                        outOfRange ? 'bg-accent/30' : 'bg-accent',
                        'shadow-[0_0_20px_2px] shadow-accent/30',
                    ].join(' ')}
                />
                <div className='absolute -top-[12px] right-8 px-2 h-[24px] rounded-full text-[10px] bg-accent text-accent-contrast'>
                    {nowLocalTime()}
                </div>
            </div>
        </div>
    );
};
