import React from 'react';
import { Task } from '@/shared/feature/task/entity/task';
import { ArrowRightIcon, CalendarFoldIcon } from 'lucide-react';
import { TaskCardContainer } from '@/shared/feature/task/interface/web/react/TaskCardContainer';
import { useDayBlockIdsQuery } from '@/feature/day-plan/interface/web/react/use-day-timeblocks-ids';
import { todayLocalDate } from '@/shared/util/local-date-helper';
import { useBlocksByIdsQuery } from '@/feature/day-plan/interface/web/react/use-blocks-by-ids';
import { Block } from '@/feature/day-plan/entity/block';
import { parseIsoDurationMs } from '@/shared/util/time-utils';

export const DayPlanTaskCard: React.FC<{
    task: Task;
    selected?: boolean;
    onBlockPrimary?: () => void;
    onBlockSecondary?: () => void;
}> = ({ task, selected = false, onBlockPrimary, onBlockSecondary }) => {
    const [hover, setHover] = React.useState(false);
    const showScheduling = selected || hover;

    const blockIdsQ = useDayBlockIdsQuery(todayLocalDate());
    const ids = blockIdsQ.data ?? [];
    const hasBlocks = blockIdsQ.status === 'success' && ids.length > 0;

    const blocksQ = useBlocksByIdsQuery(ids, { enabled: hasBlocks });

    const blocks: Block[] = React.useMemo(() => {
        if (blocksQ.status !== 'success' || !blocksQ.data) return [];
        return blocksQ.data.values().toArray();
    }, [blocksQ.status, blocksQ.data]);

    const matchingBlocks = React.useMemo(() => {
        if (blocks.length === 0) return [];
        return blocks.filter(b => {
            const blocksTask = b.category === 'task-block' ? b.taskId : b.resolvedTaskId;
            return task.id === blocksTask;
        });
    }, [blocks, task.id]);

    const isoToMinutes = React.useCallback((iso: string) => {
        return Math.round(parseIsoDurationMs(iso) / 60000);
    }, []);

    const plannedMinutes = React.useMemo(() => {
        if (matchingBlocks.length === 0) return 0;
        return matchingBlocks.reduce((sum, b) => sum + isoToMinutes(b.duration), 0);
    }, [matchingBlocks, isoToMinutes]);

    return (
        <TaskCardContainer
            onMouseOverCapture={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            task={task}
            isSelected={showScheduling}
            isMuted={matchingBlocks.length > 0}
            topBarExtra={
                plannedMinutes > 0 ? <span>[planned {plannedMinutes}m]</span> : undefined
            }
            onSelectedMenu={
                <TimeBlockingOptions
                    onBlockPrimary={onBlockPrimary}
                    onBlockSecondary={onBlockSecondary}
                />
            }
        />
    );
};

const TimeBlockingOptions: React.FC<{
    onBlockPrimary?: () => void;
    onBlockSecondary?: () => void;
}> = ({ onBlockPrimary, onBlockSecondary }) => {
    return (
        <div className={'flex flex-col gap-2'}>
            { onBlockPrimary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onBlockPrimary}
                >
                    <ArrowRightIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[b]lck</span>
                </button>
            }
            { onBlockSecondary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onBlockSecondary}
                >
                    <CalendarFoldIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[T]mrrw</span>
                </button>
            }
        </div>
    );
};
