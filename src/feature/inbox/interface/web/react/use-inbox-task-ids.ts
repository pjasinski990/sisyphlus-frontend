import { useQuery, useQueryClient } from '@tanstack/react-query';
import { taskController } from '@/shared/feature/task/interface/controller/inbox-controller';
import type { Task } from '@/shared/feature/task/entity/task';
import { keepPreviousData } from '@tanstack/query-core';
import { taskKey } from '@/shared/feature/task/interface/web/react/use-tasks';

export const inboxKey = ['tasks', 'inbox'] as const;

export function useInboxTaskIdsQuery() {
    const qc = useQueryClient();

    return useQuery({
        queryKey: inboxKey,
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
        queryFn: async () => {
            const res = await taskController.handleGetInboxTasks();
            if (!res.ok) throw new Error(res.error);
            const tasks = res.value as Task[];

            for (const t of tasks) {
                qc.setQueryData(taskKey(t.id), t);
            }

            return tasks.map(t => t.id);
        },
    });
}
