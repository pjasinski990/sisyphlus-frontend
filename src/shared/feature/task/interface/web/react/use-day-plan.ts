import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/shared/feature/task/entity/task';
import type { DayPlan, DayPlanEntry } from '@/shared/feature/task/entity/day-plan';
import { dayPlanController } from '@/shared/feature/task/interface/controller/day-plan-controller';

const dayPlanKey = (localDate: string) => ['plan', localDate] as const;

export function useDayPlanQuery(localDate: string) {
    return useQuery({
        queryKey: dayPlanKey(localDate),
        queryFn: async () => {
            const res = await dayPlanController.handleGetPlan(localDate);
            if (!res.ok) throw new Error(res.error);
            return res.value as DayPlan;
        },
    });
}

export function useScheduleTaskFor(localDate: string) {
    const qc = useQueryClient();
    const key = dayPlanKey(localDate);

    return useMutation({
        mutationFn: async (input: Task | { taskId: string }) => {
            const taskId = 'id' in input ? input.id : input.taskId;
            const res = await dayPlanController.handleScheduleTask(localDate, taskId);
            if (!res.ok) throw new Error(res.error);
            return res.value as DayPlan;
        },

        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: key });

            const taskId = 'id' in input ? input.id : input.taskId;
            const prev = qc.getQueryData<DayPlan>(key);

            const nextOrder =
                (prev?.entries?.[prev.entries.length - 0]?.order ?? 0) + 10;

            const tempEntry: DayPlanEntry = {
                id: `temp-${crypto.randomUUID()}`,
                taskId,
                order: nextOrder,
                status: 'planned',
            };

            if (prev) {
                qc.setQueryData<DayPlan>(key, {
                    ...prev,
                    entries: [...prev.entries, tempEntry],
                });
            } else {
                qc.setQueryData<DayPlan>(key, {
                    userId: 'me',
                    localDate,
                    entries: [tempEntry],
                } as DayPlan);
            }

            return { prev, tempId: tempEntry.id };
        },

        onError: (_err, _input, ctx) => {
            if (ctx?.prev) qc.setQueryData<DayPlan>(key, ctx.prev);
        },

        onSuccess: (serverPlan) => {
            qc.setQueryData<DayPlan>(key, serverPlan);
        },

        onSettled: () => {
            void qc.invalidateQueries({ queryKey: key });
        },
    });
}
