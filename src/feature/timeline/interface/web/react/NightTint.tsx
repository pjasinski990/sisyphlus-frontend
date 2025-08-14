import React from 'react';
import { timelineConfig } from '@/feature/timeline/entity/daily-timeline-config';

export const NightTint: React.FC<{
    ranges?: Array<{ from: number; to: number }>;
    className?: string;
}> = ({ ranges = [{ from: 0, to: 6 }, { from: 22, to: 24 }], className }) => {
    const cfg = timelineConfig;
    const startM = cfg.hourSpan.from * cfg.pixelsPerMinute * 60;
    const endM = cfg.hourSpan.to * cfg.pixelsPerMinute * 60;

    const rects = ranges
        .map(({ from, to }) => {
            const a = Math.max(from * cfg.pixelsPerMinute * 60, startM);
            const b = Math.min(to * cfg.pixelsPerMinute * 60, endM);
            if (b <= a) return null;
            const top = (a - startM);
            const height = Math.max(1, (b - a));
            return { top, height };
        })
        .filter(Boolean) as Array<{ top: number; height: number }>;

    if (rects.length === 0) return null;

    return (
        <div className={`absolute left-4 inset-0 z-30 pointer-events-none ${className ?? ''}`}>
            {rects.map((r, i) => (
                <div
                    key={i}
                    className='absolute inset-x-0 bg-ink-100/30 mix-blend-multiply'
                    style={{ top: r.top, height: r.height }}
                />
            ))}
        </div>
    );
};
