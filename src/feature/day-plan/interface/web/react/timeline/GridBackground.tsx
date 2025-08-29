import React from 'react';
import { timelineConfig } from '@/feature/day-plan/entity/timeline-config';

export const TimelineGridBackground: React.FC = () => {
    const hourPx = timelineConfig.pixelsPerMinute * 60;

    return (
        <div
            className='absolute inset-0 pointer-events-none opacity-50'
            style={{
                backgroundImage: [
                    'linear-gradient(to bottom, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px)',
                    'linear-gradient(to bottom, rgba(0,0,0,0.3) 0, rgba(0,0,0,0.3) 1px, transparent 1px)',
                ].join(','),
                backgroundRepeat: 'repeat, repeat',
                backgroundSize: `100% ${hourPx}px, 100% ${hourPx / 2}px`,
                backgroundPosition: 'left top, left top',
            }}
        />
    );
};
