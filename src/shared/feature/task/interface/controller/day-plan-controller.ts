import { GetDayPlan } from '@/shared/feature/task/application/port/in/get-day-plan';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { DayPlan } from '../../../../../feature/day-plan/entity/day-plan';
import { GetDayPlanUseCase } from '@/shared/feature/task/application/use-case/get-day-plan-use-case';
import { HttpDayPlanApi } from '@/shared/feature/task/infra/http-day-plan-api';
import { ScheduleTask } from '@/shared/feature/task/application/port/in/schedule-task';
import { ScheduleTaskUseCase } from '@/shared/feature/task/application/use-case/schedule-task-use-case';
import { Changeset } from '@/shared/feature/local-state/entity/changeset';

export class DayPlanController {
    constructor(
        private readonly getPlan: GetDayPlan,
        private readonly scheduleTask: ScheduleTask,
    ) { }

    handleGetPlan(localDate: string): AsyncResult<string, DayPlan> {
        return this.getPlan.execute(localDate);
    }

    handleScheduleTask(localDate: string, taskId: string): AsyncResult<string, Changeset> {
        return this.scheduleTask.execute(localDate, taskId);
    }
}

const api = new HttpDayPlanApi();
const getPlan = new GetDayPlanUseCase(api);
const scheduleTask = new ScheduleTaskUseCase(api);

export const dayPlanController = new DayPlanController(
    getPlan,
    scheduleTask,
);
