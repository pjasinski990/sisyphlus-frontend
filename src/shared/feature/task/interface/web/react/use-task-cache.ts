import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Task } from '../../../entity/task';

export function useTaskCache(tasks?: Task[]) {
    const qc = useQueryClient();
    useEffect(() => {
        if (!tasks) return;
        tasks.forEach(t => qc.setQueryData(['task', t.id], t));
    }, [qc, tasks]);
}
