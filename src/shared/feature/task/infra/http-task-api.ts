import { InboxApi } from '@/shared/feature/task/application/port/out/inbox-api';
import { Task } from '@/shared/feature/task/entity/task';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';

export class HttpTaskApi implements InboxApi {
    async create(task: Task): Promise<Task> {
        const res = await httpClient.post<Task>('/inbox', task);
        return res.data;
    }

    async getInbox(): Promise<Task[]> {
        const res = await httpClient.get<Task[]>('/inbox');
        return res.data;
    }

    async getByIds(ids: string[]): Promise<Task[]> {
        const params = new URLSearchParams();
        ids.forEach(id => params.append('ids', id));

        const url = `/task?${params.toString()}`;
        console.log('get by ids url', url);
        const res = await httpClient.get<Task[]>(url);
        return res.data;
    }
}
