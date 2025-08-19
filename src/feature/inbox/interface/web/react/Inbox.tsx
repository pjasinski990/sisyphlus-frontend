import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useInboxTasksQuery } from '@/shared/feature/task/interface/web/react/task-query-hook';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { useTaskCache } from '@/shared/feature/task/interface/web/react/use-task-cache';
import { dayPlanController } from '@/shared/feature/task/interface/controller/day-plan-controller';
import { todayLocalDate } from '@/shared/util/today-local-date';

export async function openInbox() {
    await dialogController.handleOpen({
        key: 'custom',
        payload: { children: <Inbox /> },
        options: { modal: true, dismissible: true },
    });
}

export const Inbox: React.FC = () => {
    const today = todayLocalDate();
    const query = useInboxTasksQuery();
    const { status, data, error } = query;

    useTaskCache(data);

    if (status === 'pending') {
        return <div>Loading...</div>;
    }
    if (status === 'error') {
        return <div>Error: {(error as Error)?.message}</div>;
    }

    return (
        <div className={'flex flex-1 flex-col'}>
            <div className={'flex justify-between items-center px-4'}>
                <p className={'font-bold font-mono text-secondary-1'}>
                    inbox
                </p>
            </div>
            <div className={'flex flex-col gap-4 p-4 max-h-[80vh] overflow-y-auto'}>
                { data.map((item) =>
                    <TaskCard
                        key={item.id}
                        task={item}
                        onSchedulePrimary={ () => dayPlanController.handleScheduleTask(today, item.id) }
                        onScheduleSecondary={ () => console.log('tomorrow') }
                        onScheduleCustom={ () => console.log('custom') }
                    />
                )}
            </div>
        </div>
    );
};
