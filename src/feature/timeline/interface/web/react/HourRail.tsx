import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { timelineConfig } from '@/feature/timeline/entity/daily-timeline-config';
import { EyeIcon, EyeOffIcon, Plus, Trash2Icon } from 'lucide-react';
import { clamp } from '@/shared/util/clamp';
import { v4 as uuid } from 'uuid';
import { EnergyLevel } from '@/shared/feature/task/entity/task';
import { snap } from '@/shared/util/snap';
import { AnimatePresence, motion } from 'framer-motion';
import { Tooltip } from '@/shared/util/react/components/Tooltip';


type EnergyTicker = {
    id: string;
    minutes: number;
    level: EnergyLevel;
};

const COLOR_VAR_BY_LEVEL: Record<EnergyLevel, string> = {
    low: '--color-low-energy',
    medium: '--color-medium-energy',
    high: '--color-high-energy',
};

// TODO tickers etc. should be in a separate feature with datastore for config persistence
export const HourRail: React.FC<{
    hours: number[];
    snapMinutes?: number;
    defaultVisible?: boolean;
}> = ({ hours, snapMinutes = 15, defaultVisible = true }) => {
    const hourPx = timelineConfig.pixelsPerMinute * 60;
    const startHour = hours[0] ?? 0;
    const endHour = hours[hours.length - 1] ?? 24;
    const totalMinutes = Math.max((endHour - startHour) * 60, 0);
    const railHeight = totalMinutes * timelineConfig.pixelsPerMinute;

    const [visible, setVisible] = useState<boolean>(() => {
        const v = localStorage.getItem('energyGradientVisible');
        return v ? v === '1' : defaultVisible;
    });

    const [tickers, setTickers] = useState<EnergyTicker[]>(() => {
        const saved = localStorage.getItem('energyTickers');
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as EnergyTicker[];
                return parsed.map((t) => ({ ...t, minutes: clamp(t.minutes, 0, totalMinutes) }));
            } catch { /* ignore invalid / missing record */ }
        }
        const defaultTickers = getDefaultTickers(startHour);
        return defaultTickers.map((t) => ({ ...t, minutes: clamp(t.minutes, 0, totalMinutes) }));
    });

    useEffect(() => {
        localStorage.setItem('energyGradientVisible', visible ? '1' : '0');
    }, [visible]);

    useEffect(() => {
        localStorage.setItem('energyTickers', JSON.stringify(tickers));
    }, [tickers]);

    const backgroundImage = useMemo(
        () => buildGradient({ tickers, totalMinutes }),
        [tickers, totalMinutes],
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const draggingIdRef = useRef<string | null>(null);
    const dragStartYRef = useRef<number>(0);
    const dragMovedRef = useRef<boolean>(false);

    const yToMinutes = useCallback(
        (clientY: number) => {
            const el = containerRef.current;
            if (!el) return 0;
            const rect = el.getBoundingClientRect();
            const y = clientY - rect.top;
            const m = y / timelineConfig.pixelsPerMinute;
            return clamp(m, 0, totalMinutes);
        },
        [totalMinutes],
    );

    const minutesToTop = useCallback((m: number) => m * timelineConfig.pixelsPerMinute, []);

    const onTickerPointerDown = (id: string) => (e: React.PointerEvent) => {
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        draggingIdRef.current = id;
        dragStartYRef.current = e.clientY;
        dragMovedRef.current = false;
    };

    const onPointerMove = (e: React.PointerEvent) => {
        const id = draggingIdRef.current;
        if (!id) return;
        const dy = Math.abs(e.clientY - dragStartYRef.current);
        if (dy > 2) dragMovedRef.current = true;
        const m = yToMinutes(e.clientY);
        const next = e.altKey ? m : snap(m, snapMinutes);
        setTickers((prev) => prev.map((t) => (t.id === id ? { ...t, minutes: next } : t)));
    };

    const onPointerUp = (e: React.PointerEvent) => {
        const id = draggingIdRef.current;
        if (!id) return;
        (e.currentTarget as Element).releasePointerCapture(e.pointerId);
        draggingIdRef.current = null;
        setTimeout(() => {
            dragMovedRef.current = false;
        }, 0);
    };

    const cycleLevel = (level: EnergyLevel): EnergyLevel =>
        level === 'low' ? 'medium' : level === 'medium' ? 'high' : 'low';

    const handleCycle = (id: string) =>
        setTickers((prev) => prev.map((x) => (x.id === id ? { ...x, level: cycleLevel(x.level) } : x)));

    const handleRemove = (id: string) => setTickers((prev) => prev.filter((t) => t.id !== id));

    const handleToolbarAdd = () => {
        const el = containerRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const midY = rect.top + rect.height / 12;
        const minutes = yToMinutes(midY);
        const t: EnergyTicker = { id: uuid(), minutes: snap(minutes, snapMinutes), level: 'medium' };
        setTickers((prev) => [...prev, t]);
    };

    return (
        <div
            ref={containerRef}
            className='group/rail relative w-12 shrink-0 select-none'
            style={{ height: `${railHeight}px` }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        >
            <EnergyGradientBackground image={backgroundImage} visible={visible} />
            <EnergyToolbar visible={visible} onToggle={() => setVisible((v) => !v)} onAdd={handleToolbarAdd} />
            <HourMarks hours={hours} hourPx={hourPx} />

            <HourMarks hours={hours} hourPx={hourPx} />

            <AnimatePresence>
                {visible && (
                    <motion.div
                        key='ticker-layer'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className='absolute inset-0 z-40'
                    >
                        <TickerLayer
                            tickers={tickers}
                            minutesToTop={minutesToTop}
                            onTickerPointerDown={onTickerPointerDown}
                            onCycle={(id) => {
                                if (dragMovedRef.current) return;
                                handleCycle(id);
                            }}
                            onRemove={(id) => {
                                if (dragMovedRef.current) return;
                                handleRemove(id);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


function EnergyGradientBackground({ image, visible }: { image?: string; visible: boolean }) {
    if (!image) return null;
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    key='energy-bg'
                    className='absolute top-1 bottom-1 -right-1 w-1 rounded-sm pointer-events-none'
                    style={{
                        backgroundImage: image,
                        backgroundRepeat: 'no-repeat',
                        backgroundSize: '100% 100%',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                />
            )}
        </AnimatePresence>
    );
}

function EnergyToolbar({
    visible,
    onToggle,
    onAdd,
}: {
    visible: boolean;
    onToggle: () => void;
    onAdd: () => void;
}) {
    return (
        <div className={'absolute top-1 -right-2 z-50 opacity-0 group-hover/rail:opacity-100 transition-opacity'}>
            <div className='flex flex-col items-center gap-1 rounded-md bg-surface-3 backdrop-blur px-0.5 py-0.5 shadow pointer-events-auto'>
                <button
                    type='button'
                    className='p-1 rounded hover:bg-accent/20'
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    title={visible ? 'Hide energy level timeline' : 'Show energy level timeline'}
                >
                    {visible ? <EyeOffIcon className='h-4 w-4' /> : <EyeIcon className='h-4 w-4' />}
                </button>
                <button
                    type='button'
                    className='p-1 rounded hover:bg-accent/20'
                    onClick={(e) => {
                        e.stopPropagation();
                        onAdd();
                    }}
                    title='Add energy peak'
                >
                    <Plus className='h-4 w-4' />
                </button>
            </div>
        </div>
    );
}

function HourMarks({ hours, hourPx }: { hours: number[]; hourPx: number }) {
    return (
        <div className='absolute inset-0 z-10 pointer-events-none'>
            {hours.map((h, idx) => (
                <div
                    key={h}
                    className='absolute left-2 -translate-y-1/2 text-[10px] leading-none text-muted'
                    style={{ top: `${idx * hourPx}px` }}
                >
                    {formatHour(h)}
                </div>
            ))}
        </div>
    );
}

function TickerPeak({ ticker, top, onPointerDown, onRemove, onCycle }: {
    ticker: EnergyTicker;
    top: number;
    onPointerDown: (e: React.PointerEvent) => void;
    onRemove: () => void;
    onCycle: () => void;
}) {
    return (
        <div className='absolute left-7.25 -right-13 pointer-events-none' style={{ top }}>
            <div
                className={ 'absolute inset-x-1 -translate-y-1/2 flex items-center justify-between gap-1 pointer-events-auto group/peak hover:backdrop-blur hover:shadow-md p-2 transition-colors rounded-full' }>
                {/* TODO change all labels to tooltips */}
                <Tooltip tooltip={'Drag to move'}>
                    <button
                        type='button'
                        aria-label={`${ticker.level} energy peak`}
                        className='h-4.5 w-4.5 rounded-full defined-shadow cursor-grab active:cursor-grabbing'
                        style={{ background: `var(${COLOR_VAR_BY_LEVEL[ticker.level]})` }}
                        onPointerDown={onPointerDown}
                        onClick={(e) => {
                            e.stopPropagation();
                            onCycle();
                        }}
                    />
                </Tooltip>
                <Tooltip tooltip={'Remove peak'}>
                    <button
                        type='button'
                        className='p-0.5 rounded hover:bg-destructive/15 opacity-0 group-hover/peak:opacity-100 transition-opacity cursor-pointer'
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    >
                        <Trash2Icon className='h-4.5 w-4.5' />
                    </button>
                </Tooltip>
            </div>
        </div>
    );
}

function TickerLayer({
    tickers,
    minutesToTop,
    onTickerPointerDown,
    onCycle,
    onRemove,
}: {
    tickers: EnergyTicker[];
    minutesToTop: (m: number) => number;
    onTickerPointerDown: (id: string) => (e: React.PointerEvent) => void;
    onCycle: (id: string) => void;
    onRemove: (id: string) => void;
}) {
    return (
        <div
            className={ 'absolute inset-0 z-40 opacity-0 group-hover/rail:opacity-100 transition-opacity pointer-events-none group-hover/rail:pointer-events-auto' }
        >
            {[...tickers]
                .sort((a, b) => a.minutes - b.minutes)
                .map((t) => (
                    <TickerPeak
                        key={t.id}
                        ticker={t}
                        top={minutesToTop(t.minutes)}
                        onPointerDown={onTickerPointerDown(t.id)}
                        onCycle={() => onCycle(t.id)}
                        onRemove={() => onRemove(t.id)}
                    />
                ))}
        </div>
    );
}

function getDefaultTickers(startHour: number): EnergyTicker[] {
    return [
        { id: uuid(), minutes: (7 - startHour) * 60, level: 'medium' },
        { id: uuid(), minutes: (9 - startHour) * 60, level: 'high' },
        { id: uuid(), minutes: (13 - startHour) * 60, level: 'medium' },
        { id: uuid(), minutes: (14 - startHour) * 60, level: 'low' },
        { id: uuid(), minutes: (17 - startHour) * 60, level: 'medium' },
        { id: uuid(), minutes: (19 - startHour) * 60, level: 'medium' },
        { id: uuid(), minutes: (22 - startHour) * 60, level: 'low' },
    ];
}

function buildGradient({ tickers, totalMinutes, fadeMinutes = 100, alphaPercent = 70 }: {
    tickers: EnergyTicker[];
    totalMinutes: number;
    fadeMinutes?: number;
    alphaPercent?: number;
}): string | undefined {
    if (!tickers.length || totalMinutes <= 0) return undefined;
    const sorted = [...tickers].sort((a, b) => a.minutes - b.minutes);
    const pct = (m: number) => `${(100 * clamp(m, 0, totalMinutes) / totalMinutes).toFixed(4)}%`;
    const color = (lvl: EnergyLevel) =>
        `color-mix(in oklch, var(${COLOR_VAR_BY_LEVEL[lvl]}) ${alphaPercent}%, transparent)`;
    const stops: string[] = [];
    stops.push('transparent 0%');
    const first = sorted[0];
    const firstStart = Math.max(first.minutes - fadeMinutes, 0);
    stops.push(`transparent ${pct(firstStart)}`);
    stops.push(`${color(first.level)} ${pct(first.minutes)}`);
    for (let i = 0; i < sorted.length - 1; i++) {
        const a = sorted[i];
        const b = sorted[i + 1];
        const mid = (a.minutes + b.minutes) / 2;
        const start = Math.max(mid - fadeMinutes / 2, a.minutes);
        const end = Math.min(mid + fadeMinutes / 2, b.minutes);
        stops.push(`${color(a.level)} ${pct(start)}`);
        stops.push(`${color(b.level)} ${pct(end)}`);
    }
    const last = sorted[sorted.length - 1];
    const lastEnd = Math.min(last.minutes + fadeMinutes, totalMinutes);
    stops.push(`${color(last.level)} ${pct(last.minutes)}`);
    stops.push(`transparent ${pct(lastEnd)}`);
    stops.push('transparent 100%');
    return `linear-gradient(to bottom, ${stops.join(', ')})`;
}

function formatHour(h: number) {
    return `${String(h).padStart(2, '0')}:00`;
}
