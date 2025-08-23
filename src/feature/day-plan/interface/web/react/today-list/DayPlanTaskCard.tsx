import React from 'react';
import { Task } from '@/shared/feature/task/entity/task';
import { ArrowRightIcon, CalendarArrowUpIcon, CalendarFoldIcon } from 'lucide-react';
import { TaskCardContainer } from '@/shared/feature/task/interface/web/react/TaskCardContainer';

export const DayPlanTaskCard: React.FC<{
    task: Task,
    selected?: boolean,
    onBlockPrimary?: () => void,
    onBlockSecondary?: () => void,
}> = ({ task, selected = false, onBlockPrimary, onBlockSecondary }) => {
    const [hover, setHover] = React.useState(false);
    const showScheduling = selected || hover;

    return (
        <TaskCardContainer
            onMouseOverCapture={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            task={task} selected={showScheduling}
            onSelectedMenu={
                <TimeBlockingOptions
                    onBlockPrimary={onBlockPrimary}
                    onBlockSecondary={onBlockSecondary}
                />
            } />
    );
};

const TimeBlockingOptions: React.FC<{
    onBlockPrimary?: () => void,
    onBlockSecondary?: () => void
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
