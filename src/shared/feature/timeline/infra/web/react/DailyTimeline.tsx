import React from 'react';
import { clamp } from '@/shared/feature/util/clamp';
import { Range } from '@/shared/feature/util/range';
import { timelineConfig } from '@/shared/feature/timeline/entity/daily-timeline-config';
import { TimelineGridBackground } from '@/shared/feature/timeline/infra/web/react/GridBackground';
import { HourRail } from '@/shared/feature/timeline/infra/web/react/HourRail';
import { CurrentTimePointer } from '@/shared/feature/timeline/infra/web/react/CurrentTimePointer';
import { TaskBlock } from '@/shared/feature/timeline/infra/web/react/TaskBlock';
import { Task, TimeOfDay } from '../../../entity/task';

type DailyTimelineProps = {
    tasks?: Task[];
    onRequestCreate?: (range: Range<TimeOfDay>) => void;
};

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ tasks = [], onRequestCreate }) => {
    const cfg = timelineConfig;
    const startHour = cfg.hourSpan.from;
    const endHour = cfg.hourSpan.to;
    const totalMinRaw = (endHour - startHour) * 60;
    const totalMin = Math.max(1, totalMinRaw);
    const ppm = cfg.pixelsPerMinute;
    const segmentMin = cfg.segmentMinutes ?? 15;
    const contentHeightPx = totalMin * ppm;

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

    const scrollerRef = React.useRef<HTMLDivElement | null>(null);
    React.useEffect(() => {
        const el = scrollerRef.current;
        if (!el) return;
        const y = minutesSinceStart * ppm - el.clientHeight / 2;
        el.scrollTo({ top: clamp(y, 0, contentHeightPx), behavior: 'auto' });
    }, []);

    const handleCreate = React.useCallback(
        (mFrom: number, mTo: number) => {
            if (!onRequestCreate) {
                const fromStr = minutesToHHMM(startHour * 60 + mFrom);
                const toStr = minutesToHHMM(startHour * 60 + mTo);
                console.log('Create task range:', { from: fromStr, to: toStr });
                return;
            }
            const fromStr = minutesToHHMM(startHour * 60 + mFrom);
            const toStr = minutesToHHMM(startHour * 60 + mTo);
            onRequestCreate({ from: fromStr as TimeOfDay, to: toStr as TimeOfDay });
        },
        [onRequestCreate, startHour]
    );

    return (
        <div className='flex flex-1 mt-4 mb-8 bg-surface-2 rounded-xl defined-shadow'>
            <div className='flex flex-1 p-4'>
                <div className={'flex flex-1 py-4 overflow-y-auto'}>
                    <div className={'flex flex-1 relative'} ref={scrollerRef} style={{ height: contentHeightPx }}>
                        <HourRail hours={hours} />
                        <div className={'flex flex-1 px-4'}>
                            <div className={'flex flex-1 relative'}>
                                <TimelineGridBackground />
                                <CurrentTimePointer progress={progress} now={now} />
                                <TaskLayer>
                                    {tasks.map((t) => (
                                        <TaskBlock
                                            key={`${t.timespan.from}-${t.timespan.to}-${t.title}`}
                                            timespan={t.timespan}
                                            title={t.title}
                                            timelineStartHour={startHour}
                                            timelineTotalMin={totalMin}
                                        />
                                    ))}
                                </TaskLayer>

                                <SelectionLayer
                                    ppm={ppm}
                                    totalMin={totalMin}
                                    startHour={startHour}
                                    segmentMin={segmentMin}
                                    scrollerRef={scrollerRef}
                                    onCreate={handleCreate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SelectionLayer: React.FC<{
    ppm: number;
    totalMin: number;
    startHour: number;
    segmentMin: number;
    scrollerRef: React.RefObject<HTMLDivElement | null>;
    onCreate: (mFrom: number, mTo: number) => void;
}> = ({ ppm, totalMin, segmentMin, scrollerRef, onCreate }) => {
    const rootRef = React.useRef<HTMLDivElement | null>(null);

    const [hoverMin, setHoverMin] = React.useState<number | null>(null);
    const [dragStart, setDragStart] = React.useState<number | null>(null);
    const [dragCurrent, setDragCurrent] = React.useState<number | null>(null);

    const dragging = dragStart !== null && dragCurrent !== null;

    const getYWithinScrollContent = (e: React.PointerEvent) => {
        const scroller = scrollerRef.current;
        if (!scroller) return 0;
        const rect = scroller.getBoundingClientRect();
        return (e.clientY - rect.top) + scroller.scrollTop; // y relative to top of scroll content
    };

    const toMinutes = (y: number) => clamp(y / ppm, 0, totalMin);
    const qFloor = (m: number) => Math.floor(m / segmentMin) * segmentMin;
    const qCeil  = (m: number) => Math.ceil(m / segmentMin) * segmentMin;

    const onPointerMove = (e: React.PointerEvent) => {
        const y = getYWithinScrollContent(e);
        const m = toMinutes(y);

        if (dragging) {
            setDragCurrent(m);
        } else {
            setHoverMin(qFloor(m));
        }
    };

    const onPointerLeave = () => {
        if (!dragging) setHoverMin(null);
    };

    const onPointerDown = (e: React.PointerEvent) => {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        const y = getYWithinScrollContent(e);
        const m = toMinutes(y);
        setDragStart(m);
        setDragCurrent(m);
    };

    const onPointerUp = (e: React.PointerEvent) => {
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);

        if (dragStart === null || dragCurrent === null) {
            // click without proper start; ignore
            setDragStart(null);
            setDragCurrent(null);
            return;
        }
        let a = qFloor(dragStart);
        let b = qCeil(dragCurrent);

        if (a === b) b = a + segmentMin; // minimum one segment on click

        a = clamp(a, 0, totalMin);
        b = clamp(b, 0, totalMin);

        // normalize
        const from = Math.min(a, b);
        const to = Math.max(a, b);

        onCreate(from, to);

        setHoverMin(null);
        setDragStart(null);
        setDragCurrent(null);
    };

    const hoverRect =
        hoverMin !== null && !dragging
            ? { top: hoverMin * ppm, height: segmentMin * ppm }
            : null;

    const selectionRect =
        dragging && dragStart !== null && dragCurrent !== null
            ? (() => {
                const a = qFloor(dragStart) * ppm;
                const b = qCeil(dragCurrent) * ppm;
                const top = Math.min(a, b);
                const height = Math.max(3, Math.abs(b - a));
                return { top, height };
            })()
            : null;

    return (
        <div
            ref={rootRef}
            className='absolute inset-0 z-30'
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerLeave}
        >
            {hoverRect && (
                <div
                    className='absolute inset-0 rounded-md bg-accent/10'
                    style={{ top: hoverRect.top, height: hoverRect.height }}
                />
            )}

            {selectionRect && (
                <div
                    className='absolute inset-0 rounded-md border border-accent/50 bg-accent/20'
                    style={{ top: selectionRect.top, height: selectionRect.height }}
                />
            )}
        </div>
    );
};

const TaskLayer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className='h-full absolute inset-x-8 z-20 pointer-events-none'>{children}</div>
);

const useNow = (intervalMs = 30_000) => {
    const [now, setNow] = React.useState(() => new Date());
    React.useEffect(() => {
        const id = setInterval(() => setNow(new Date()), intervalMs);
        return () => clearInterval(id);
    }, [intervalMs]);
    return now;
};

const minutesToHHMM = (totalMinsFromMidnight: number) => {
    const m = ((totalMinsFromMidnight % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};
