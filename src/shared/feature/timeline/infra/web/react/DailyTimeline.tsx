import React from 'react';
import { clamp } from '@/shared/feature/util/clamp';
import { timelineConfig } from '../../../entity/daily-timeline-config';
import { Range } from '@/shared/feature/util/range'
import { GridBackground } from '@/shared/feature/timeline/infra/web/react/GridBackground';
import { HourRail } from '@/shared/feature/timeline/infra/web/react/HourRail';
import { CurrentTimePointer } from '@/shared/feature/timeline/infra/web/react/CurrentTimePointer';

type TimeOfDay = `${number}:${number}`;

interface Task {
    timespan: Range<TimeOfDay>;
    title: string;
}

interface TaskBlockProps {
    timespan: Range<TimeOfDay>;
    title: string;
    timelineStartHour: number;
    timelineTotalMin: number;
}

export const DailyTimeline: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const { from: startHour, to: endHour } = timelineConfig.hourSpan;
    const totalMinRaw = (endHour - startHour) * 60;
    const totalMin = Math.max(1, totalMinRaw);
    const now = useNow();

    const minutesSinceStart = React.useMemo(() => {
        const mins = now.getHours() * 60 + now.getMinutes();
        return clamp(mins - startHour * 60, 0, totalMin);
    }, [now, startHour, totalMin]);

    const progress = (minutesSinceStart / totalMin) * 100;

    const hours = React.useMemo(
        () => Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i),
        [startHour, endHour]
    );

    return (
        <div className='relative flex flex-1 mt-4 mb-8 bg-surface-2 rounded-xl defined-shadow overflow-hidden'>
            <HourRail hours={hours} />

            <div className='relative flex-1'>
                <div className='absolute inset-x-8 top-6 bottom-6'>
                    <GridBackground />
                    <CurrentTimePointer progress={progress} now={now} />
                    <TaskLayer>
                        {(tasks && tasks.length > 0 && tasks.map((t: Task) => (
                            <TaskBlock
                                key={`${t.timespan.from}-${t.timespan.to}-${t.title}`}
                                timespan={t.timespan}
                                title={t.title}
                                timelineStartHour={startHour}
                                timelineTotalMin={totalMin}
                            />
                        )))}
                    </TaskLayer>
                </div>
            </div>
        </div>
    );
};

const TaskLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className='relative h-full'>{children}</div>
);

export const TaskBlock: React.FC<TaskBlockProps> = ({ timespan, title, timelineStartHour, timelineTotalMin }) => {
    const topMin = toMinutesFromStart(timespan.from, timelineStartHour, timelineTotalMin);
    const bottomMin = timelineTotalMin - toMinutesFromStart(timespan.to, timelineStartHour, timelineTotalMin);

    return (
        <div
            className='absolute inset-x-6 rounded-lg border border-ink-5 bg-surface-3/70 backdrop-blur-[2px] px-3 py-2 hover:bg-surface-3'
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

const useNow = (intervalMs = 30_000) => {
    const [now, setNow] = React.useState(() => new Date());
    React.useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
};
