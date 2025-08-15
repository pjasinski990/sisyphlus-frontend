import { PushToInbox } from '@/shared/feature/task/application/port/in/push-to-inbox';
import { Task } from '@/shared/feature/task/entity/task';
import { PushToInboxUseCase } from '@/shared/feature/task/application/use-case/push-to-inbox-use-case';
import { HttpTaskApi } from '@/shared/feature/task/infra/http-task-api';
import { GetInboxTasksUseCase } from '@/shared/feature/task/application/use-case/get-inbox-tasks-use-case';
import { GetInboxTasks } from '@/shared/feature/task/application/port/in/get-inbox-tasks';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export class TaskController {
    constructor(
        private readonly pushToInbox: PushToInbox,
        private readonly getInboxTasks: GetInboxTasks,
    ) { }

    async handlePushToInbox(task: Task): AsyncResult<string, Task> {
        return this.pushToInbox.execute(task);
    }

    async handleGetInboxTasks(): AsyncResult<string, Task[]> {
        return this.getInboxTasks.execute();
    }
}

const api = new HttpTaskApi();
const pushToInbox = new PushToInboxUseCase(api);
const getInboxTasks = new GetInboxTasksUseCase(api);

export const taskController = new TaskController(
    pushToInbox,
    getInboxTasks,
);
