import React from 'react';
import { getBlockRenderMetrics } from './get-block-render-metrics';
import type { TimelineConfig } from '@/feature/day-plan/entity/timeline-config';
import type { Block } from '@/feature/day-plan/entity/block';
import type { Task } from '@/shared/feature/task/entity/task';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import { RowSkeleton } from '@/shared/util/react/components/RowSkeleton';

export const BlockCard: React.FC<{
    cfg: TimelineConfig;
    block: Block;
}> = ({ cfg, block }) => {
    const wantedId =
        (block as any).category === 'tag-block'
            ? (block as any).resolvedTaskId ?? null
            : (block as any).taskId ?? null;

    const { data: taskMap, isLoading, isFetching, error, } = useTasksByIdsQuery(wantedId ? [wantedId] : [], { enabled: !!wantedId });

    const task: Task | null =
        wantedId && taskMap ? taskMap.get(wantedId) ?? null : null;
    const m = getBlockRenderMetrics(block, cfg.hourSpan);
    const showSkeleton = !task && (isLoading || (isFetching && !taskMap));

    const title = task
        ? task.title
        : block.category === 'tag-block'
            ? `Work on #${(block as any).tag}`
            : wantedId ? 'Loading…' : '(unspecified task)';

    return (
        <div
            className="absolute z-40 pointer-events-auto min-w-[200px] rounded-md bg-surface-3/70 hover:bg-surface-3 border-b-2 border-surface-2/50 backdrop-blur-[2px] px-3 py-2 defined-shadow"
            style={{ top: `${m.topPct}%`, height: `${m.heightPct}%` }}
        >
            {showSkeleton ? (
                <RowSkeleton />
            ) : (
                <>
                    <div className="text-sm font-medium line-clamp-2">{title}</div>
                    <div className="text-xs">{m.labelFrom}–{m.labelTo}</div>
                    {error && (
                        <div className="mt-1 text-[11px] text-danger-500/80">
                            Failed to load task.
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
