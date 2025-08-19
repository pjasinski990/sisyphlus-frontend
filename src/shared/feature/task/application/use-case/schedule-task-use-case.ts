import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { DayPlan } from '@/shared/feature/task/entity/day-plan';
import { ScheduleTask } from '@/shared/feature/task/application/port/in/schedule-task';
import { DayPlanApi } from '@/shared/feature/task/application/port/out/day-plan-api';

export class ScheduleTaskUseCase implements ScheduleTask {
    constructor(
        private readonly api: DayPlanApi,
    ) { }

    async execute(localDate: string, taskId: string): AsyncResult<string, DayPlan> {
        try {
            const res = await this.api.scheduleTask(localDate, taskId);
            return ok(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return nok(error.message);
            } else {
                return nok('Unknown error scheduling task');
            }
        }
    }
}
