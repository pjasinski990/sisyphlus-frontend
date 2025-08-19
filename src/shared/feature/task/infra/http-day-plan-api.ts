import { DayPlanApi } from '@/shared/feature/task/application/port/out/day-plan-api';
import { DayPlan } from '../entity/day-plan';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';

export class HttpDayPlanApi implements DayPlanApi {
    async getPlan(localDate: string): Promise<DayPlan> {
        const res = await httpClient.get<DayPlan>(`/day-plan/${localDate}`);
        return res.data;
    }

    async scheduleTask(localDate: string, taskId: string): Promise<DayPlan> {
        const res = await httpClient.post<DayPlan>(`/day-plan/${localDate}`, { taskId });
        return res.data;
    }
}
