import React from 'react';
import { motion, PanInfo } from 'framer-motion';
import { getBlockRenderMetrics } from './get-block-render-metrics';
import type { TimelineConfig } from '@/feature/day-plan/entity/timeline-config';
import type { Block } from '@/feature/day-plan/entity/block';
import type { Task } from '@/shared/feature/task/entity/task';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import { normalizeHHmm, parseIsoDurationMs } from '@/shared/util/time-utils';
import { useUpdateBlockInDayPlanMutation } from '../use-update-timeblock-mutation';

const SNAP_MIN = 5;
const MIN_DURATION_MIN = 5;

type DragKind = 'move' | 'resize-top' | 'resize-bottom' | null;

export const BlockCard: React.FC<{ cfg: TimelineConfig; block: Block }> = ({ cfg, block }) => {
    const wantedId =
        block.category === 'tag-block' ? (block.resolvedTaskId ?? null) : (block.taskId ?? null);

    const { data: taskMap, isLoading, isFetching, error } =
        useTasksByIdsQuery(wantedId ? [wantedId] : [], { enabled: !!wantedId });

    const task: Task | null = wantedId && taskMap ? (taskMap.get(wantedId) ?? null) : null;

    const updateMut = useUpdateBlockInDayPlanMutation(block.localDate);

    const startMin0 = hhmmToMinutes(normalizeHHmm(block.localTime));
    const durMin0 = Math.max(1, Math.round(parseIsoDurationMs(block.duration) / 60000));
    const spanStartMin = Math.round(cfg.hourSpan.from * 60);
    const spanEndMin = Math.round(cfg.hourSpan.to * 60);

    const [dragKind, setDragKind] = React.useState<DragKind>(null);
    const [draftStartMin, setDraftStartMin] = React.useState<number | null>(null);
    const [draftDurMin, setDraftDurMin] = React.useState<number | null>(null);
    const [visualOffsetPx, setVisualOffsetPx] = React.useState(0);

    const isDrafting = dragKind !== null;
    const displayStartMin = isDrafting ? (draftStartMin ?? startMin0) : startMin0;
    const displayDurMin = isDrafting ? (draftDurMin ?? durMin0) : durMin0;

    const m = React.useMemo(() => {
        const displayBlock: Block = {
            ...block,
            localTime: minutesToHHmm(displayStartMin),
            duration: minutesToIso(displayDurMin),
        };
        return getBlockRenderMetrics(displayBlock, cfg.hourSpan);
    }, [block, cfg.hourSpan, displayDurMin, displayStartMin]);

    const showSkeleton = !task && (isLoading || (isFetching && !taskMap));
    const title = task
        ? task.title
        : block.category === 'tag-block'
            ? `Work on #${block.tag}`
            : wantedId ? 'Loading…' : '(unspecified task)';

    function resetDraft() {
        setDragKind(null);
        setDraftStartMin(null);
        setDraftDurMin(null);
        setVisualOffsetPx(0);
    }

    function splitSnap(deltaPx: number, pxPerMin: number) {
        const rawMin = deltaPx / Math.max(pxPerMin, 0.0001);
        const snappedMin = snapMinutes(Math.round(rawMin));
        const snappedPx = snappedMin * pxPerMin;
        const remainderPx = deltaPx - snappedPx;
        return { snappedMin, remainderPx };
    }

    function onMovePanStart() {
        setDragKind('move');
        setDraftStartMin(startMin0);
        setDraftDurMin(durMin0);
        setVisualOffsetPx(0);
    }
    function onMovePan(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (dragKind !== 'move') return;
        const { snappedMin, remainderPx } = splitSnap(info.offset.y, cfg.pixelsPerMinute);
        const newStart = clampNum(
            startMin0 + snappedMin,
            spanStartMin,
            Math.max(spanEndMin - durMin0, spanStartMin)
        );
        setDraftStartMin(newStart);
        setDraftDurMin(durMin0);
        setVisualOffsetPx(remainderPx);
    }
    function onMovePanEnd() {
        if (dragKind !== 'move') return resetDraft();
        const finalStart = draftStartMin ?? startMin0;
        if (finalStart !== startMin0) {
            updateMut.mutate({ id: block.id, localDate: block.localDate, localTime: minutesToHHmm(finalStart) });
        }
        resetDraft();
    }

    function onTopResizePanStart(e: React.PointerEvent) {
        e.stopPropagation();
        setDragKind('resize-top');
        setDraftStartMin(startMin0);
        setDraftDurMin(durMin0);
        setVisualOffsetPx(0);
    }
    function onTopResizePan(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (dragKind !== 'resize-top') return;
        const { snappedMin, remainderPx } = splitSnap(info.offset.y, cfg.pixelsPerMinute);
        const newStart = clampNum(
            startMin0 + snappedMin,
            spanStartMin,
            startMin0 + durMin0 - MIN_DURATION_MIN
        );
        const newDur = clampNum(
            durMin0 - (newStart - startMin0),
            MIN_DURATION_MIN,
            spanEndMin - newStart
        );
        setDraftStartMin(newStart);
        setDraftDurMin(newDur);
        setVisualOffsetPx(remainderPx);
    }
    function onTopResizePanEnd() {
        if (dragKind !== 'resize-top') return resetDraft();
        const ns = draftStartMin ?? startMin0;
        const nd = draftDurMin ?? durMin0;
        if (ns !== startMin0 || nd !== durMin0) {
            updateMut.mutate({
                id: block.id,
                localDate: block.localDate,
                localTime: minutesToHHmm(ns),
                duration: minutesToIso(nd),
            });
        }
        resetDraft();
    }

    function onBotResizePanStart(e: React.PointerEvent) {
        e.stopPropagation();
        setDragKind('resize-bottom');
        setDraftStartMin(startMin0);
        setDraftDurMin(durMin0);
        setVisualOffsetPx(0);
    }
    function onBotResizePan(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (dragKind !== 'resize-bottom') return;
        const { snappedMin } = splitSnap(info.offset.y, cfg.pixelsPerMinute);
        const newDur = clampNum(durMin0 + snappedMin, MIN_DURATION_MIN, spanEndMin - startMin0);
        setDraftDurMin(newDur);
        setDraftStartMin(startMin0);
    }
    function onBotResizePanEnd() {
        if (dragKind !== 'resize-bottom') return resetDraft();
        const nd = draftDurMin ?? durMin0;
        if (nd !== durMin0) {
            updateMut.mutate({ id: block.id, localDate: block.localDate, duration: minutesToIso(nd) });
        }
        resetDraft();
    }

    const labelFrom = minutesToHHmm(displayStartMin);
    const labelTo = minutesToHHmm(displayStartMin + displayDurMin);

    return (
        <motion.div
            key={block.id}
            layoutId={block.id}
            className='absolute z-40 pointer-events-auto min-w-[200px] rounded-md bg-surface-3/70 hover:bg-surface-3 border-b-2 border-surface-2/50 backdrop-blur-[2px] px-3 pt-3 pb-2 defined-shadow'
            style={{
                top: `${m.topPct}%`,
                height: `${m.heightPct}%`,
                transform: visualOffsetPx ? `translateY(${visualOffsetPx}px)` : undefined,
            }}
            initial={{ opacity: 0, y: 0, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
        >
            <motion.div
                className='absolute left-1 right-1 top-0 h-3 rounded-t-md cursor-ns-resize select-none'
                style={{ touchAction: 'none' }}
                onPanStart={onTopResizePanStart}
                onPan={onTopResizePan}
                onPanEnd={onTopResizePanEnd}
            >
                <div className='mx-auto mt-[3px] h-[4px] w-12 rounded-full bg-surface-1/80 shadow-sm' />
            </motion.div>

            <motion.div
                className='mt-4 mb-2 h-6 rounded-md bg-surface-2/60 border border-surface-1/40 flex items-center justify-center text-[11px] uppercase tracking-wide cursor-grab select-none'
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => e.stopPropagation()}
                onPanStart={onMovePanStart}
                onPan={onMovePan}
                onPanEnd={onMovePanEnd}
            >
                Drag to move
            </motion.div>

            {showSkeleton ? (
                <RowSkeleton />
            ) : (
                <>
                    <div className='text-sm font-medium line-clamp-2'>{title}</div>
                    <div className='text-xs'>
                        {labelFrom}–{labelTo}
                        {isDrafting && <span className='ml-2 text-[11px] opacity-70'>(preview)</span>}
                    </div>
                    {error && (
                        <div className='mt-1 text-[11px] text-danger-500/80'>
                            Failed to load task.
                        </div>
                    )}
                </>
            )}

            <motion.div
                className='absolute left-1 right-1 bottom-0 h-4 rounded-b-md cursor-ns-resize select-none'
                style={{ touchAction: 'none' }}
                onPanStart={onBotResizePanStart}
                onPan={onBotResizePan}
                onPanEnd={onBotResizePanEnd}
            >
                <div className='mx-auto mb-[3px] h-[4px] w-12 rounded-full bg-surface-1/80 shadow-sm' />
            </motion.div>
        </motion.div>
    );
};

function clampNum(v: number, min: number, max: number): number {
    return Math.min(Math.max(v, min), max);
}
function snapMinutes(min: number): number {
    const step = SNAP_MIN;
    return Math.round(min / step) * step;
}
function hhmmToMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(':').map(n => parseInt(n, 10));
    const hh = Number.isFinite(h) ? h : 0;
    const mm = Number.isFinite(m) ? m : 0;
    return hh * 60 + mm;
}
function minutesToHHmm(total: number): string {
    const t = Math.max(0, Math.round(total));
    const h = Math.floor(t / 60);
    const m = t % 60;
    const hs = String(h).padStart(2, '0');
    const ms = String(m).padStart(2, '0');
    return `${hs}:${ms}`;
}
function minutesToIso(min: number): string {
    const m = Math.max(MIN_DURATION_MIN, Math.round(min));
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0 && mm > 0) return `PT${h}H${mm}M`;
    if (h > 0) return `PT${h}H`;
    return `PT${mm}M`;
}
