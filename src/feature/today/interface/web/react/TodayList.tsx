import React from 'react';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';
import { useDayPlanQuery } from '@/shared/feature/task/interface/web/react/use-day-plan';
import { useTasksByIdsQuery } from '@/shared/feature/task/interface/web/react/use-tasks-by-ids';
import type { Task } from '@/shared/feature/task/entity/task';
import { openInbox } from '@/feature/inbox/interface/web/react/Inbox';
import { WavyText } from '@/shared/util/react/components/WavyText';
import { todayLocalDate } from '@/shared/util/local-date-helper';

export const TodayList: React.FC = () => {
    const today = todayLocalDate();

    const planQ = useDayPlanQuery(today);

    const ids = planQ.data?.entries.map(e => e.taskId) ?? [];
    const tasksEnabled = planQ.status === 'success' && ids.length > 0;

    const tasksQ = useTasksByIdsQuery(ids, { enabled: tasksEnabled });

    const isInitialPlanLoading = planQ.status === 'pending' && !planQ.data;
    if (isInitialPlanLoading) {
        return (
            <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'>
                <div className='border-b border-surface-1/50 px-4 py-2'>Plan for <span className='font-mono text-secondary-2'>today</span></div>
                <div className='flex flex-col gap-4 p-4'>
                    <RowSkeleton />
                    <RowSkeleton />
                    <RowSkeleton />
                </div>
            </div>
        );
    }

    if (planQ.status === 'error') {
        return <div className='text-danger p-4'>Error: {(planQ.error as Error)?.message}</div>;
    }

    const taskById = (tasksQ.data ?? new Map<string, Task>());

    return (
        <div className='flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow my-8'>
            <TopFetchingBar active={planQ.isFetching || tasksQ.isFetching} />
            <div className='border-b border-surface-1/50 px-4 py-2'>
                Plan for <span className='font-mono text-secondary-2'>today</span>
            </div>
            <div className='flex flex-col gap-4 p-4'>
                {planQ.data?.entries.length === 0 && <EmptyPlanPlaceholder />}

                {planQ.data?.entries.map(entry => {
                    const task = taskById.get(entry.taskId);

                    if (task) {
                        return <TaskCard key={entry.id} task={task} />;
                    }

                    if (tasksEnabled && tasksQ.status === 'pending') {
                        return <RowSkeleton key={entry.id} />;
                    }

                    if (tasksQ.isFetching) {
                        return <RowSkeleton key={entry.id} />;
                    }

                    return <div key={entry.id} className='text-muted italic'>Task unavailable</div>;
                })}
            </div>
        </div>
    );
};

const TopFetchingBar: React.FC<{ active: boolean }> = ({ active }) => (
    <div
        className={ `h-0.5 w-full overflow-hidden rounded bg-surface-1/60 transition-opacity ${active ? 'opacity-100' : 'opacity-0'}` }
        aria-hidden='true'
    >
        <div className='h-full w-1/3 animate-[topbar_1.2s_ease-in-out_infinite]' />
        <style>{`@keyframes topbar {
                      0% { transform: translateX(-120%); }
                      50% { transform: translateX(60%); }
                      100% { transform: translateX(120%); }
                  }`}
        </style>
    </div>
);

const RowSkeleton: React.FC = () => (
    <div className='rounded-lg bg-surface-1/50 p-4'>
        <div className='h-4 w-1/3 animate-pulse rounded bg-surface-1/80 mb-3' />
        <div className='h-3 w-2/3 animate-pulse rounded bg-surface-1/80' />
    </div>
);

const EmptyPlanPlaceholder: React.FC = () => {
    return (
        <div className='flex flex-col justify-center text-center'>
            <h2 className='text-muted'>No tasks planned yet.</h2>
            <p className='inline-block text-muted text-sm'>
                Select from tasks added to your
                <button
                    className='inline-block px-1 py-0.5 font-mono rounded-sm text-secondary-1 hover:bg-surface-1/50 cursor-pointer'
                    onClick={openInbox}
                >
                    <WavyText byLetter={true} amp={'0.05em'} stagger={'0.1s'} shakeMin={'0.0'} shakeMax={'0.0'} text={'inbox [I]'} />
                </button>
            </p>
        </div>
    );
};
