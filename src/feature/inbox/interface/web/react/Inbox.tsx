import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useInboxTaskIdsQuery } from '@/feature/inbox/interface/web/react/use-inbox-task-ids';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { todayLocalDate, tomorrowLocalDate } from '@/shared/util/local-date-helper';
import { useScheduleTaskFor } from '@/feature/day-plan/interface/web/react/use-day-plan';
import { Task } from '@/shared/feature/task/entity/task';
import { openCommandPalette } from '@/app-init/shortcut-handlers/open-command-pallete';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';

export async function openInbox() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <Inbox /> },
        options: { modal: true, dismissible: true },
    });
}

export const Inbox: React.FC = () => {
    const idsQ = useInboxTaskIdsQuery();
    const ids = idsQ.data ?? [];

    const tasksQ = useTasksByIdsQuery(ids, {
        enabled: idsQ.status === 'success' && ids.length > 0,
    });

    if (idsQ.status === 'pending') return <div>Loading...</div>;
    if (idsQ.status === 'error') return <div>Error: {(idsQ.error as Error)?.message}</div>;

    if (ids.length === 0) {
        return (
            <div className='flex flex-1 flex-col px-4'>
                <div className='flex justify-between items-center'>
                    <p className='font-bold font-mono text-secondary-1'>inbox</p>
                </div>
                <EmptyInboxPlaceholder />
            </div>
        );
    }

    if (tasksQ.status === 'pending') return <div>Loading...</div>;
    if (tasksQ.status === 'error') return <div>Error: {(tasksQ.error as Error)?.message}</div>;

    const tasksInOrder: Task[] = ids
        .map(id => tasksQ.data?.get(id))
        .filter((t): t is Task => !!t);

    return (
        <div className={'flex flex-1 flex-col px-4'}>
            <div className={'flex justify-between items-center'}>
                <p className={'font-bold font-mono text-secondary-1'}>inbox</p>
            </div>
            <InboxTaskList tasks={tasksInOrder} />
        </div>
    );
};

const EmptyInboxPlaceholder = () => {
    return (
        <div className={'text-muted px-8 pt-4 pb-8'}>
            <h2>
                Nothing here yet.
            </h2>
            <p>
                * Dump your tasks quickly using the
                <button
                    className={'inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-3 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={() => openCommandPalette()}
                >
                    command palette [C-k]
                </button>
                .
            </p>
            <p className={'inline'}>
                * Press
                <button
                    className={'inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-3 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={() => openCommandPalette('add ')}
                >
                    [A]
                </button>
                to immediately open it with &quot;add&quot; command.
            </p>
            <p>
                * These keyboard shortcuts work when no dialogs are open.
            </p>
        </div>
    );
};

const InboxTaskList: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    const today = todayLocalDate();
    const tomorrow = tomorrowLocalDate();

    const { mutate: scheduleToday } = useScheduleTaskFor(today);
    const { mutate: scheduleTomorrow } = useScheduleTaskFor(tomorrow);

    return (
        <div className={'flex flex-col gap-4 p-4 max-h-[80vh] overflow-y-auto'}>
            { tasks.map((item) =>
                <TaskCard
                    key={item.id}
                    task={item}
                    onSchedulePrimary={() => scheduleToday(item)}
                    onScheduleSecondary={() => scheduleTomorrow(item)}
                    onScheduleCustom={() => console.log('custom')}
                />
            )}
        </div>
    );
};
