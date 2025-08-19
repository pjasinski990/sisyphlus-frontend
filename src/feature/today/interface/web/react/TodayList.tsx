import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useDayPlanQuery } from '@/shared/feature/task/interface/web/react/day-plan-query-hook';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import type { Task } from '@/shared/feature/task/entity/task';

export const TodayList: React.FC = () => {
    const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD

    const planQ = useDayPlanQuery(today);

    const ids = planQ.data?.entries.map(e => e.taskId) ?? [];
    const tasksEnabled = planQ.status === 'success' && ids.length > 0;

    const tasksQ = useTasksByIdsQuery(ids, { enabled: tasksEnabled });

    if (planQ.status === 'pending') return <div>Loading...</div>;
    if (planQ.status === 'error') return <div>Error: {(planQ.error as Error)?.message}</div>;

    if (tasksEnabled && tasksQ.status === 'pending') return <div>Loading...</div>;
    if (tasksQ.status === 'error') return <div>Error: {(tasksQ.error as Error)?.message}</div>;

    const taskById = (tasksQ.data ?? new Map<string, Task>());

    return (
        <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'>
            <div className='border-b border-surface-1/50 px-4 py-2'>Today:</div>
            <div className='flex flex-col gap-4 p-4'>
                {planQ.data.entries.length === 0 && (
                    <div className='text-muted italic'>No tasks planned yet.</div>
                )}

                {planQ.data.entries.map(entry => {
                    const task = taskById.get(entry.taskId);
                    return task
                        ? <TaskCard key={entry.id} task={task} />
                        : <div key={entry.id} className='text-muted italic'>Task unavailable</div>;
                })}
            </div>
        </div>
    );
};
