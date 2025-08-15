import { TaskApi } from '@/shared/feature/task/application/port/out/task-api';
import { Task } from '@/shared/feature/task/entity/task';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';

export class HttpTaskApi implements TaskApi {
    async create(task: Task): Promise<Task> {
        const res = await httpClient.post<Task>('/tasks', task);
        return res.data;
    }

    async getInbox(): Promise<Task[]> {
        const res = await httpClient.get<Task[]>('/tasks');
        return res.data;
    }
}
