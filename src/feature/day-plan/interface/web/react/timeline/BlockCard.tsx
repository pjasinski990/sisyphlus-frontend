import React, { useRef } from 'react';
import { AnimatePresence, motion, MotionStyle, PanInfo } from 'framer-motion';
import { getBlockRenderMetrics } from './get-block-render-metrics';
import type { TimelineConfig } from '@/feature/day-plan/entity/timeline-config';
import type { Block } from '@/feature/day-plan/entity/block';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';
import {
    hhmmToMinutes,
    minutesToHHmm,
    minutesToIso,
    normalizeHHmm,
    parseIsoDurationMs,
} from '@/shared/util/time-utils';
import { useUpdateBlockInDayPlanMutation } from '../use-update-timeblock-mutation';
import { clamp } from '@/shared/util/clamp';
import { snap } from '@/shared/util/snap';
import { CheckCheckIcon, CheckIcon, ChevronsUpDownIcon, GripIcon, Trash2Icon } from 'lucide-react';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { Tooltip } from '@/shared/util/react/components/Tooltip';
import { useRemoveTimeblockMutation } from '@/feature/day-plan/interface/web/react/use-remove-timeblock-mutation';
import { todayLocalDate } from '@/shared/util/local-date-helper';

const SNAP_MIN = 15;
const MIN_DURATION_MIN = 5;

const MIN_VISIBLE_MIN = 15;
const COMPACT_THRESHOLD_MIN = 45;

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
    const cardRef = useRef<HTMLDivElement>(null);
    const contextOpenRef = React.useRef(false);

    const [compactLock, setCompactLock] = React.useState<boolean | null>(null);

    const isDrafting = dragKind !== null;
    const displayStartMin = isDrafting ? (draftStartMin ?? startMin0) : startMin0;
    const displayDurMin = isDrafting ? (draftDurMin ?? durMin0) : durMin0;

    const isCompactComputed = displayDurMin < COMPACT_THRESHOLD_MIN;
    const isCompact = compactLock ?? isCompactComputed;

    const baseMetrics = React.useMemo(() => {
        return getBlockRenderMetrics(block, cfg.hourSpan);
    }, [block, cfg.hourSpan]);

    const showSkeleton = !task && (isLoading || (isFetching && !taskMap));
    const title = task
        ? task.title
        : block.category === 'tag-block'
            ? `Work on #${block.tag}`
            : wantedId
                ? 'Loading...'
                : '(unspecified task)';

    function resetDraft() {
        setDragKind(null);
        setDraftStartMin(null);
        setDraftDurMin(null);
        setDragAccumPx(0);
        setCompactLock(null);
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
        setCompactLock(isCompactComputed);
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
            Math.max(spanEndMin - durMin0, spanStartMin),
        );
        setDraftStartMin(newStart);
        setDragAccumPx(nextAccum);
    }
    function onMovePanEnd() {
        if (dragKind !== 'move') return resetDraft();
        const finalStart = draftStartMin ?? startMin0;
        if (finalStart !== startMin0) {
            updateMut.mutate({
                id: block.id,
                localDate: block.localDate,
                localTime: minutesToHHmm(finalStart),
            });
        }
        resetDraft();
    }

    function onResizePanStart(e: PointerEvent) {
        e.stopPropagation();
        setCompactLock(isCompactComputed);
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
            updateMut.mutate({
                id: block.id,
                localDate: block.localDate,
                duration: minutesToIso(nd, MIN_DURATION_MIN),
            });
        }
        resetDraft();
    }

    const { mutateAsync } = useRemoveTimeblockMutation(todayLocalDate());
    const openContextMenu = React.useCallback(() => {
        if (dragKind) return;
        if (contextOpenRef.current) return;
        contextOpenRef.current = true;
        void dialogController
            .handleOpen({
                key: 'context-menu',
                payload: {
                    children: (
                        <div className='rounded-md bg-surface-3 px-4 py-2 flex flex-1 justify-between gap-4 defined-shadow'>
                            <Tooltip tooltip={'Remove'}>
                                <button
                                    className={'flex items-center p-2 bg-surface-2/50 hover:bg-surface-2 transition-colors rounded-sm cursor-pointer'}
                                    onClick={async () => {
                                        const res = await dialogController.handleOpen<{ confirmed: boolean }>({
                                            key: 'confirm',
                                            payload: {
                                                title: 'Confirmation',
                                                message: 'Really remove block?',
                                                danger: true,
                                            }
                                        });
                                        if (!res?.confirmed) return;
                                        await mutateAsync(block.id);
                                    }}
                                >
                                    <Trash2Icon className='w-4 h-4 inline' />
                                    <span className={'ml-1 font-mono text-xs'}>[x]</span>
                                </button>
                            </Tooltip>
                            <Tooltip tooltip={'Mark block completed'}>
                                <button className={'flex items-center p-2 bg-surface-2/50 hover:bg-surface-2 transition-colors rounded-sm cursor-pointer'}>
                                    <CheckIcon className='w-4 h-4 inline' />
                                    <span className={'ml-1 font-mono text-xs'}>[c]</span>
                                </button>
                            </Tooltip>
                            <Tooltip tooltip={'Mark block and task completed'}>
                                <button className={'flex items-center p-2 bg-surface-2/50 hover:bg-surface-2 transition-colors rounded-sm cursor-pointer'}>
                                    <CheckCheckIcon className='w-4 h-4 inline' />
                                    <span className={'ml-1 font-mono text-xs'}>[C]</span>
                                </button>
                            </Tooltip>
                        </div>
                    ),
                },
                options: {
                    variant: 'anchored',
                    anchor: { getRect: () => cardRef.current?.getBoundingClientRect() ?? null },
                    side: 'auto',
                    align: 'start',
                    offset: 4,
                    matchWidth: true,
                    dismissible: true,
                    modal: false,
                    zIndex: 50,
                },
            })
            .finally(() => {
                contextOpenRef.current = false;
            });
    }, [block.id, dragKind, mutateAsync]);

    const labelFrom = minutesToHHmm(displayStartMin);
    const labelTo = minutesToHHmm(displayStartMin + displayDurMin);

    const dynamicStyle: MotionStyle = {};
    if (dragKind === 'move') {
        dynamicStyle.y = dragAccumPx;
    } else if (dragKind === 'resize') {
        dynamicStyle.height = `calc(${baseMetrics.heightPct}% + ${dragAccumPx}px)`;
    }

    const minHeightPx = MIN_VISIBLE_MIN * cfg.pixelsPerMinute;

    const bgVarName = task?.energy
        ? COLOR_VAR_BY_LEVEL[task.energy]
        : '--color-surface-3';

    const bgBase = `color-mix(in srgb, var(${bgVarName}) 50%, transparent)`;
    const bgHover = `color-mix(in srgb, var(${bgVarName}) 70%, transparent)`;

    return (
        <motion.div
            ref={cardRef}
            key={block.id}
            className={`absolute z-40 inset-0 pointer-events-auto min-w-[240px] rounded-md backdrop-blur-[2px] pl-3 ${isCompact ? 'pr-12' : 'pr-5'} ${isCompact ? 'py-0' : 'py-2'} defined-shadow cursor-pointer`}
            style={{
                top: `${baseMetrics.topPct}%`,
                height: `${baseMetrics.heightPct}%`,
                minHeight: `${minHeightPx}px`,
                willChange: 'transform, height, background',
                background: bgBase,
                ...dynamicStyle,
            }}
            whileHover={{ background: bgHover }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
            onClick={openContextMenu}
            role='button'
            aria-label='Open block menu'
        >
            {showSkeleton ? (
                <RowSkeleton />
            ) : (
                <div>
                    <AnimatePresence initial={false} mode='popLayout'>
                        {isCompact ? (
                            <motion.div
                                key='compact'
                                initial={{ opacity: 0, y: -4, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -4, scale: 0.99 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.6 }}
                            >
                                <div className='flex items-center justify-between gap-2'>
                                    <div className='min-w-0'>
                                        <div className='text-xs font-medium truncate'>
                                            {title}{' '}
                                            <span className='opacity-70'>
                                                ({labelFrom}-{labelTo})
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key='full'
                                initial={{ opacity: 0, y: 4, scale: 0.99 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.99 }}
                                transition={{ type: 'spring', stiffness: 380, damping: 32, mass: 0.6 }}
                            >
                                <div>
                                    <div className='text-sm font-medium line-clamp-2'>{title}</div>
                                    <div className='text-xs'>
                                        {labelFrom}–{labelTo}
                                        {isDrafting && <span className='ml-2 text-[11px] opacity-70'>(preview)</span>}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && (
                        <div className='mt-1 text-[11px] text-danger-500/80'>Failed to load task.</div>
                    )}
                </div>
            )}

            <motion.div
                className={`absolute ${isCompact ? 'right-6' : 'right-1' } ${isCompact ? 'top-0' : 'top-1' } h-5 w-5 flex items-center justify-center cursor-grab select-none`}
                style={{ touchAction: 'none' }}
                onPointerDown={(e) => e.stopPropagation()}
                onPanStart={onMovePanStart}
                onPan={onMovePan}
                onPanEnd={onMovePanEnd}
                aria-label='Drag to move'
                role='button'
            >
                <GripIcon className='w-4 h-4' />
            </motion.div>

            <motion.div
                className={`absolute right-1 ${isCompact ? 'top-0' : 'bottom-1' } h-5 w-5 flex items-center justify-center cursor-ns-resize select-none`}
                style={{ touchAction: 'none' }}
                onPanStart={onResizePanStart}
                onPan={onResizePan}
                onPanEnd={onResizePanEnd}
                aria-label='Drag to resize'
                role='button'
            >
                <ChevronsUpDownIcon className='w-4 h-4' />
            </motion.div>
        </motion.div>
    );
};

const COLOR_VAR_BY_LEVEL: Record<EnergyLevel, string> = {
    low: '--color-low-energy',
    medium: '--color-medium-energy',
    high: '--color-high-energy',
};
