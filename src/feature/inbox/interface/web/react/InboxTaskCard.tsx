import React from 'react';
import { Task } from '@/shared/feature/task/entity/task';
import { CalendarArrowUpIcon, CalendarClockIcon, CalendarFoldIcon } from 'lucide-react';
import { TaskCardContainer } from '@/shared/feature/task/interface/web/react/TaskCardContainer';

export const InboxTaskCard: React.FC<{
    task: Task,
    selected?: boolean,
    onSchedulePrimary?: () => void,
    onScheduleSecondary?: () => void
    onScheduleCustom?: () => void }
> = ({ task, selected = false, onSchedulePrimary, onScheduleSecondary, onScheduleCustom }) => {
    const [hover, setHover] = React.useState(false);
    const showScheduling = selected || hover;

    return (
        <TaskCardContainer
            onMouseOverCapture={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            task={task} selected={showScheduling}
            onSelectedMenu={
                <SchedulingOptions
                    onSchedulePrimary={onSchedulePrimary}
                    onScheduleSecondary={onScheduleSecondary}
                    onScheduleCustom={onScheduleCustom}
                />
        } />
    );
};

const SchedulingOptions: React.FC<{
    onSchedulePrimary?: () => void,
    onScheduleSecondary?: () => void
    onScheduleCustom?: () => void
}> = ({ onSchedulePrimary, onScheduleSecondary, onScheduleCustom }) => {
    return (
        <div className={'flex flex-col gap-2'}>
            { onSchedulePrimary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onSchedulePrimary}
                >
                    <CalendarArrowUpIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[t]oday</span>
                </button>
            }
            { onScheduleSecondary &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onScheduleSecondary}
                >
                    <CalendarFoldIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[T]mrrw</span>
                </button>
            }
            { onScheduleCustom &&
                <button
                    className={'flex items-center gap-2 px-1 py-0.5 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={onScheduleCustom}
                >
                    <CalendarClockIcon className={'inline w-4 h-4 stroke-secondary-2'} />
                    <span className={'inline text-sm text-secondary-2 font-mono leading-none'}>[o]ther</span>
                </button>
            }
        </div>
    );
};
