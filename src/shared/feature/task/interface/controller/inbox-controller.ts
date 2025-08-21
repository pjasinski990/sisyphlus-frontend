import { PushToInbox } from '@/feature/inbox/application/port/in/push-to-inbox';
import { Task } from '@/shared/feature/task/entity/task';
import { PushToInboxUseCase } from '@/feature/inbox/application/use-case/push-to-inbox-use-case';
import { HttpTaskApi } from '@/shared/feature/task/infra/http-task-api';
import { GetInboxTasksUseCase } from '@/feature/inbox/application/use-case/get-inbox-tasks-use-case';
import { GetInboxTasks } from '@/feature/inbox/application/port/in/get-inbox-tasks';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { GetByIdsUseCase } from '@/shared/feature/task/application/use-case/get-by-ids-use-case';
import { GetByIds } from '@/shared/feature/task/application/port/in/get-by-ids';

export class InboxController {
    constructor(
        private readonly pushToInbox: PushToInbox,
        private readonly getInboxTasks: GetInboxTasks,
        private readonly getByIds: GetByIds,
    ) { }

    async handlePushToInbox(task: Task): AsyncResult<string, Task> {
        return this.pushToInbox.execute(task);
    }

    async handleGetInboxTasks(): AsyncResult<string, Task[]> {
        return this.getInboxTasks.execute();
    }

    async handleGetByIds(ids: string[]): AsyncResult<string, Task[]> {
        return this.getByIds.execute(ids);
    }
}

const api = new HttpTaskApi();
const pushToInbox = new PushToInboxUseCase(api);
const getInboxTasks = new GetInboxTasksUseCase(api);
const getByIds = new GetByIdsUseCase(api);

export const taskController = new InboxController(
    pushToInbox,
    getInboxTasks,
    getByIds,
);
