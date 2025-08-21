import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { ScheduleTask } from '@/shared/feature/task/application/port/in/schedule-task';
import { DayPlanApi } from '@/feature/day-plan/application/port/out/day-plan-api';
import { Changeset } from '@/shared/feature/local-state/entity/changeset';

export class ScheduleTaskUseCase implements ScheduleTask {
    constructor(
        private readonly api: DayPlanApi,
    ) { }

    async execute(localDate: string, taskId: string): AsyncResult<string, Changeset> {
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
