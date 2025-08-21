import { useQuery } from '@tanstack/react-query';
import { taskController } from '@/shared/feature/task/interface/controller/inbox-controller';
import type { Task } from '@/shared/feature/task/entity/task';

export const taskKey = (id: string) => ['task', id] as const;

export function useTaskQuery(id: string | undefined, opts?: { enabled?: boolean }) {
    return useQuery({
        queryKey: id ? taskKey(id) : ['task', 'undefined'],
        enabled: !!id && (opts?.enabled ?? true),
        queryFn: async (): Promise<Task> => {
            const res = await taskController.handleGetByIds([id!]);
            if (!res.ok) throw new Error(res.error);
            const [task] = res.value as Task[];
            if (!task) throw new Error('Task not found');
            return task;
        },
        staleTime: 15_000,
        refetchOnWindowFocus: false,
    });
}
