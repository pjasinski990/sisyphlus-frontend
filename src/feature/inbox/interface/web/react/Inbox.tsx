import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useInboxTasksQuery } from '@/shared/feature/task/interface/web/react/task-query-hook';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';

export async function openInbox() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <Inbox /> },
        options: { modal: true, dismissible: true },
    });
}

export const Inbox: React.FC = () => {
    const { data: tasks = [], isLoading } = useInboxTasksQuery();
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={'flex flex-1 flex-col'}>
            <div className={'flex justify-between items-center border-b border-surface-1/50 px-4 pb-2'}>
                <p className={'font-bold'}>
                    Inbox
                </p>
            </div>
            <div className={'flex flex-col gap-4 p-4'}>
                { tasks.map((item) =>
                    <TaskCard key={item.id} task={item} />
                )}
            </div>
        </div>
    );
};
