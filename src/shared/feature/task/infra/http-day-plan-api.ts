import { DayPlanApi } from '@/shared/feature/task/application/port/out/day-plan-api';
import { DayPlan } from '../entity/day-plan';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';
import { Task } from '../entity/task';

export class HttpDayPlanApi implements DayPlanApi {
    async getPlan(localDate: string): Promise<DayPlan> {
        const res = await httpClient.get<DayPlan>(`/day-plan/${localDate}`);
        return res.data;
    }

    async scheduleTask(localDate: string, taskId: string): Promise<DayPlan> {
        const res = await httpClient.post<DayPlan>(`/day-plan/${localDate}/entries`, { taskId });
        return res.data;
    }
}

export interface ScheduleTaskResponse {
    changes: {
        tasks: Array<Partial<Task & { id: string, _deleted: boolean }>>
        dayPlans: Array<DayPlan & { id: string, _deleted: boolean }>
    }
}
