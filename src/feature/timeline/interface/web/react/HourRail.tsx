import React from 'react';
import { timelineConfig } from '@/feature/timeline/entity/daily-timeline-config';

export const HourRail: React.FC<{ hours: number[] }> = ({ hours }) => {
    const hourPx = timelineConfig.pixelsPerMinute * 60;

    return (
        <div className='relative w-10 shrink-0'>
            <div className='absolute inset-0 text-muted'>
                {hours.map((h, idx) => (
                    <div
                        key={h}
                        className='absolute left-2 -translate-y-1/2 pr-2 text-xs select-none'
                        style={{ top: `${idx * hourPx}px` }}
                    >
                        {formatHour(h)}
                    </div>
                ))}
            </div>
        </div>
    );
};

const formatHour = (h: number) => `${String(h).padStart(2, '0')}:00`;
