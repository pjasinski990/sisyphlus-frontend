import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useInboxTasksQuery } from '@/shared/feature/task/interface/web/react/use-inbox-tasks';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { todayLocalDate, tomorrowLocalDate } from '@/shared/util/local-date-helper';
import { useScheduleTaskFor } from '@/shared/feature/task/interface/web/react/use-day-plan';
import { Task } from '@/shared/feature/task/entity/task';
import { openCommandPalette } from '@/app/shortcut-handlers/open-command-pallete';

export async function openInbox() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <Inbox /> },
        options: { modal: true, dismissible: true },
    });
}

export const Inbox: React.FC = () => {
    const query = useInboxTasksQuery();
    const { status, data, error } = query;

    if (status === 'pending') {
        return <div>Loading...</div>;
    }
    if (status === 'error') {
        return <div>Error: {(error as Error)?.message}</div>;
    }

    return (
        <div className={'flex flex-1 flex-col px-4'}>
            <div className={'flex justify-between items-center'}>
                <p className={'font-bold font-mono text-secondary-1'}>
                    inbox
                </p>
            </div>
            { data?.length === 0
                ? <EmptyInboxPlaceholder />
                : <InboxTaskList tasks={data} />
            }
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
                * The keyboard shortcuts work when no dialogs are open.
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
                    onSchedulePrimary={ () => scheduleToday(item) }
                    onScheduleSecondary={ () => scheduleTomorrow(item) }
                    onScheduleCustom={ () => console.log('custom') }
                />
            )}
        </div>
    );
};
