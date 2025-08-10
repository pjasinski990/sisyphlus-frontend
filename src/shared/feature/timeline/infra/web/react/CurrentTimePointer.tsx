import React from 'react';
import { timelineConfig } from '@/shared/feature/timeline/entity/daily-timeline-config';

export const CurrentTimePointer: React.FC<{ progress: number, now: Date }> = ({ progress, now }) => {
    const { from: startHour, to: endHour } = timelineConfig.hourSpan;
    const nowDecimal = now.getHours() + now.getMinutes() / 60;
    const outOfRange = nowDecimal < startHour || nowDecimal > endHour;

    return (
        <div
            className='absolute left-0 right-0'
            style={{ top: `${progress}%` }}
            aria-label={`Current time: ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
        >
            <div className='relative'>
                <div
                    className={[
                        'h-[1px] w-full',
                        outOfRange ? 'bg-accent/30' : 'bg-accent',
                        'shadow-[0_0_10px_2px] shadow-accent/30',
                    ].join(' ')}
                />
                <div className='absolute -top-[12px] right-8 px-2 h-[24px] rounded-full text-[10px] bg-accent text-white/95'>
                    {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};
