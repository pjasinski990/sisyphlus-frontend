import React from 'react';
import { useInboxTasksQuery } from '@/shared/feature/task/interface/web/react/task-query-hook';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';

export const TodayList: React.FC = () => {
    const { data: tasks = [], isLoading } = useInboxTasksQuery();
    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className={'flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'}>
            <div className={'border-b border-surface-1/50 px-4 py-2'}>
                Today:
            </div>
            <div className={'flex flex-col gap-4 p-4'}>
                { tasks.map((item) =>
                    <TaskCard key={item.id} task={item} />
                )}
            </div>
        </div>
    );
};
