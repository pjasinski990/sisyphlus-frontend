import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useDayPlanQuery } from '@/shared/feature/task/interface/web/react/day-plan-query-hook';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import type { Task } from '@/shared/feature/task/entity/task';
import { openInbox } from '@/feature/inbox/interface/web/react/Inbox';
import { WavyText } from '@/shared/util/react/components/WavyText';

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
            <div className='border-b border-surface-1/50 px-4 py-2'>Plan for <span className={'font-mono text-secondary-2'}>today</span></div>
            <div className='flex flex-col gap-4 p-4'>
                {planQ.data.entries.length === 0 && (
                    <EmptyPlanPlaceholder />
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

const EmptyPlanPlaceholder: React.FC = () => {
    return (
        <div className={'flex flex-col justify-center text-center'}>
            <h2 className={'text-muted'}>No tasks planned yet.</h2>
            <p className={'inline-block text-muted text-sm'}>
                Select from tasks added to your
                <button
                    className={'inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-1 hover:bg-surface-1/50 cursor-pointer'}
                    onClick={openInbox}
                >
                    <WavyText amp={'0.1rem'} stagger={'0.08s'} shakeMin={'0'} shakeMax={'0'} text={'inbox [I]'} />
                </button>
            </p>
        </div>
    );
};
