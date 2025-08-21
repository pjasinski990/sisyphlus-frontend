import { DayPlanApi } from '@/feature/day-plan/application/port/out/day-plan-api';
import { DayPlan } from '../entity/day-plan';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';
import { Task } from '../entity/task';
import { Changeset } from '@/shared/feature/local-state/entity/changeset';

export class HttpDayPlanApi implements DayPlanApi {
    async getPlan(localDate: string): Promise<DayPlan> {
        const res = await httpClient.get<DayPlan>(`/day-plan/${localDate}`);
        return res.data;
    }

    async scheduleTask(localDate: string, taskId: string): Promise<Changeset> {
        const res = await httpClient.post<Changeset>(`/day-plan/${localDate}/entries`, { taskId });
        return res.data;
    }
}
