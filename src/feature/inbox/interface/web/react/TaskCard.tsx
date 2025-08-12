import React from 'react';
import { Task } from '@/shared/feature/task/entity/task';

export const TaskCard: React.FC<{ task: Task }> = ({ task }) => {
    return (
        <div className={'bg-secondary-1/90 stone-texture py-2 px-4 rounded-sm defined-shadow'}>
            <p>{task.title}</p>
        </div>
    );
};
