import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskController } from '@/shared/feature/task/interface/controller/inbox-controller';
import type { Task } from '@/shared/feature/task/entity/task';
import { v4 as uuid } from 'uuid';

export const inboxKey = ['tasks','inbox'] as const;

export function useInboxTasksQuery() {
    return useQuery({
        queryKey: inboxKey,
        queryFn: async () => {
            const res = await taskController.handleGetInboxTasks();
            if (!res.ok) throw new Error(res.error);
            return res.value;
        },
    });
}

export function usePushToInboxMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (task: Task) => {
            const res = await taskController.handlePushToInbox(task);
            if (!res.ok) throw new Error(res.error);
            return res.value;
        },

        onMutate: async (inputTask) => {
            await qc.cancelQueries({ queryKey: inboxKey });
            const prev = qc.getQueryData<Task[]>(inboxKey) ?? [];

            const temp: Task = { ...inputTask, id: `temp-${uuid()}` };
            qc.setQueryData<Task[]>(inboxKey, [...prev, temp]);

            return { prev, tempId: temp.id };
        },

        onError: (_err, _input, ctx) => {
            if (ctx) qc.setQueryData(inboxKey, ctx.prev);
        },

        onSuccess: (serverTask, _input, ctx) => {
            if (ctx) {
                qc.setQueryData<Task[]>(inboxKey, (old = []) =>
                    old.map(t => (t.id === ctx.tempId ? serverTask : t)),
                );
            }
        },

        onSettled: () => {
            void qc.invalidateQueries({ queryKey: inboxKey });
        },
    });
}
