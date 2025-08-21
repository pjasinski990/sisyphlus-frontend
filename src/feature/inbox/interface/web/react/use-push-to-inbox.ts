import { useMutation, useQueryClient } from '@tanstack/react-query';
import { taskController } from '@/shared/feature/task/interface/controller/inbox-controller';
import type { Task } from '@/shared/feature/task/entity/task';
import { v4 as uuid } from 'uuid';
import { inboxKey } from './use-inbox-task-ids';
import { taskKey } from '@/shared/feature/task/interface/web/react/use-tasks';

export function usePushToInboxMutation() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (task: Task) => {
            const res = await taskController.handlePushToInbox(task);
            if (!res.ok) throw new Error(res.error);
            return res.value as Task;
        },

        onMutate: async (inputTask) => {
            await qc.cancelQueries({ queryKey: inboxKey });

            const prevIds = qc.getQueryData<string[]>(inboxKey) ?? [];
            const tempId = `temp-${uuid()}`;
            const tempTask: Task = { ...inputTask, id: tempId };

            qc.setQueryData<string[]>(inboxKey, [...prevIds, tempId]);
            qc.setQueryData(taskKey(tempId), tempTask);

            return { prevIds, tempId };
        },

        onError: (_err, _input, ctx) => {
            if (!ctx) return;
            qc.setQueryData(inboxKey, ctx.prevIds);
        },

        onSuccess: (serverTask, _input, ctx) => {
            if (!ctx) return;

            qc.setQueryData<string[]>(inboxKey, (old = []) =>
                old.map(id => (id === ctx.tempId ? serverTask.id : id)),
            );

            qc.setQueryData(taskKey(serverTask.id), serverTask);
        },

        onSettled: () => {
            void qc.invalidateQueries({ queryKey: inboxKey });
        },
    });
}
