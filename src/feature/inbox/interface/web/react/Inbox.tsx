import React from 'react';
import { mockTasks } from '@/shared/feature/task/infra/testing/mock-task';
import { TaskCard } from '@/feature/inbox/interface/web/react/TaskCard';

export const Inbox: React.FC = () => {
    return (
        <div className={'flex flex-1 flex-col bg-surface-2 rounded-xl defined-shadow mt-4 mb-8'}>
            <div className={'border-b border-surface-1/50 px-4'}>
                <p className={''}>
                    Inbox
                </p>
            </div>
            <div className={'flex flex-col gap-4 p-4'}>
                { mockTasks.map((item) =>
                    <TaskCard key={item.id} task={item} />
                )}
            </div>
        </div>
    );
};
