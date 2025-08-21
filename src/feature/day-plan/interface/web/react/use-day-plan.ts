import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/shared/feature/task/entity/task';
import type { DayPlan } from '@/shared/feature/task/entity/day-plan';
import { dayPlanController } from '@/shared/feature/task/interface/controller/day-plan-controller';
import { keepPreviousData } from '@tanstack/query-core';
import { dayPlanKey } from '@/feature/day-plan/interface/web/react/day-plan-cache-adapter';
import { applyChangeset } from '@/shared/feature/local-state/entity/cache-adapter';

export function useDayPlanQuery(localDate: string) {
    return useQuery({
        queryKey: dayPlanKey(localDate),
        queryFn: async () => {
            const res = await dayPlanController.handleGetPlan(localDate);
            if (!res.ok) throw new Error(res.error);
            return res.value as DayPlan;
        },
        placeholderData: keepPreviousData,
        staleTime: 15_000,
        refetchOnWindowFocus: false,
    });
}

export function useScheduleTaskFor(localDate: string) {
    const qc = useQueryClient();
    const key = dayPlanKey(localDate);

    return useMutation({
        mutationFn: async (input: Task | { taskId: string }) => {
            const taskId = 'id' in input ? input.id : input.taskId;
            return dayPlanController.handleScheduleTask(localDate, taskId);
        },

        onMutate: async (input) => {
            await qc.cancelQueries({ queryKey: key });

            const taskId = 'id' in input ? input.id : input.taskId;
            const prevPlan = qc.getQueryData<DayPlan>(key);

            const nextOrder =
                ((prevPlan?.entries?.[prevPlan.entries.length - 1]?.order) ?? 0) + 10;

            applyChangeset(qc, [
                { kind: 'event', type: 'PlanEntryAdded', payload: { planDate: localDate, taskId, order: nextOrder } },
            ]);

            return { prevPlan };
        },

        onError: (_err, _input, ctx) => {
            if (ctx?.prevPlan) qc.setQueryData<DayPlan>(key, ctx.prevPlan);
        },

        onSuccess: (changeset) => {
            if (!changeset.ok) {
                throw new Error('Unexpected error in day-plan changeset');
            }
            applyChangeset(qc, changeset.value);
        },

        onSettled: () => {
            void qc.invalidateQueries({ queryKey: key });
        },
    });
}
