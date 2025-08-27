import React from 'react';
import { motion, MotionStyle, PanInfo } from 'framer-motion';
import { getBlockRenderMetrics } from './get-block-render-metrics';
import type { TimelineConfig } from '@/feature/day-plan/entity/timeline-config';
import type { Block } from '@/feature/day-plan/entity/block';
import type { Task } from '@/shared/feature/task/entity/task';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import { hhmmToMinutes, minutesToIso, minutesToHHmm, normalizeHHmm, parseIsoDurationMs } from '@/shared/util/time-utils';
import { useUpdateBlockInDayPlanMutation } from '../use-update-timeblock-mutation';
import { clamp } from '@/shared/util/clamp';
import { snap } from '@/shared/util/snap';

const SNAP_MIN = 15;
const MIN_DURATION_MIN = 5;

type DragKind = 'move' | 'resize' | null;

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
    const [dragAccumPx, setDragAccumPx] = React.useState(0);

    const isDrafting = dragKind !== null;
    const displayStartMin = isDrafting ? (draftStartMin ?? startMin0) : startMin0;
    const displayDurMin = isDrafting ? (draftDurMin ?? durMin0) : durMin0;

    const baseMetrics = React.useMemo(() => {
        return getBlockRenderMetrics(block, cfg.hourSpan);
    }, [block, cfg.hourSpan]);

    const showSkeleton = !task && (isLoading || (isFetching && !taskMap));
    const title = task
        ? task.title
        : block.category === 'tag-block'
            ? `Work on #${block.tag}`
            : wantedId ? 'Loading...' : '(unspecified task)';

    function resetDraft() {
        setDragKind(null);
        setDraftStartMin(null);
        setDraftDurMin(null);
        setDragAccumPx(0);
    }

    function getSnappedMin(totalDeltaPx: number, pxPerMin: number) {
        const rawMin = totalDeltaPx / Math.max(pxPerMin, 0.0001);
        return snap(Math.round(rawMin), SNAP_MIN);
    }

    function clampMoveAccumPx(nextPx: number): number {
        const minDeltaMin = spanStartMin - startMin0;
        const maxDeltaMin = (spanEndMin - durMin0) - startMin0;
        return clamp(nextPx, minDeltaMin * cfg.pixelsPerMinute, maxDeltaMin * cfg.pixelsPerMinute);
    }

    function clampResizeAccumPx(nextPx: number): number {
        const minDeltaMin = MIN_DURATION_MIN - durMin0;
        const maxDeltaMin = (spanEndMin - startMin0) - durMin0;
        return clamp(nextPx, minDeltaMin * cfg.pixelsPerMinute, maxDeltaMin * cfg.pixelsPerMinute);
    }

    function onMovePanStart() {
        setDragKind('move');
        setDraftStartMin(startMin0);
        setDraftDurMin(durMin0);
        setDragAccumPx(0);
    }

    function onMovePan(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (dragKind !== 'move') return;
        const nextAccum = clampMoveAccumPx(dragAccumPx + info.delta.y);
        const snappedMin = getSnappedMin(nextAccum, cfg.pixelsPerMinute);
        const newStart = clamp(
            startMin0 + snappedMin,
            spanStartMin,
            Math.max(spanEndMin - durMin0, spanStartMin)
        );
        setDraftStartMin(newStart);
        setDragAccumPx(nextAccum);
    }

    function onMovePanEnd() {
        if (dragKind !== 'move') return resetDraft();
        const finalStart = draftStartMin ?? startMin0;
        if (finalStart !== startMin0) {
            updateMut.mutate({ id: block.id, localDate: block.localDate, localTime: minutesToHHmm(finalStart) });
        }
        resetDraft();
    }

    function onResizePanStart(e: PointerEvent) {
        e.stopPropagation();
        setDragKind('resize');
        setDraftStartMin(startMin0);
        setDraftDurMin(durMin0);
        setDragAccumPx(0);
    }

    function onResizePan(_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
        if (dragKind !== 'resize') return;
        const nextAccum = clampResizeAccumPx(dragAccumPx + info.delta.y);
        const snappedMin = getSnappedMin(nextAccum, cfg.pixelsPerMinute);
        const newDur = clamp(durMin0 + snappedMin, MIN_DURATION_MIN, spanEndMin - startMin0);
        setDraftDurMin(newDur);
        setDragAccumPx(nextAccum);
    }

    function onResizePanEnd() {
        if (dragKind !== 'resize') return resetDraft();
        const nd = draftDurMin ?? durMin0;
        if (nd !== durMin0) {
            updateMut.mutate({ id: block.id, localDate: block.localDate, duration: minutesToIso(nd, MIN_DURATION_MIN) });
        }
        resetDraft();
    }

    const labelFrom = minutesToHHmm(displayStartMin);
    const labelTo = minutesToHHmm(displayStartMin + displayDurMin);

    const dynamicStyle: MotionStyle = {};
    if (dragKind === 'move') {
        dynamicStyle.y = dragAccumPx;
    } else if (dragKind === 'resize') {
        dynamicStyle.height = `calc(${baseMetrics.heightPct}% + ${dragAccumPx}px)`;
    }

    return (
        <motion.div
            key={block.id}
            className='absolute z-40 pointer-events-auto min-w-[200px] rounded-md bg-surface-3/70 hover:bg-surface-3 border-b-2 border-surface-2/50 backdrop-blur-[2px] px-3 pt-6 pb-2 defined-shadow'
            style={{
                top: `${baseMetrics.topPct}%`,
                height: `${baseMetrics.heightPct}%`,
                willChange: 'transform, height',
                ...dynamicStyle,
            }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
        >
            <motion.div
                className='absolute left-0 right-0 top-0 h-5 flex items-center justify-center cursor-grab select-none'
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => e.stopPropagation()}
                onPanStart={onMovePanStart}
                onPan={onMovePan}
                onPanEnd={onMovePanEnd}
                aria-label='Drag to move'
                role='button'
            >
                <div className='flex flex-col gap-[2px]'>
                    <div className='h-[2px] w-10 rounded-full bg-surface-1/80 shadow-sm' />
                    <div className='h-[2px] w-10 rounded-full bg-surface-1/80 shadow-sm' />
                    <div className='h-[2px] w-10 rounded-full bg-surface-1/80 shadow-sm' />
                </div>
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
                className='absolute left-1 right-1 bottom-0 h-3 rounded-b-md cursor-ns-resize select-none'
                style={{ touchAction: 'none' }}
                onPanStart={onResizePanStart}
                onPan={onResizePan}
                onPanEnd={onResizePanEnd}
            >
                <div className='mx-auto my-auto h-[3px] w-12 rounded-full bg-surface-1/80 shadow-sm' />
            </motion.div>
        </motion.div>
    );
};
