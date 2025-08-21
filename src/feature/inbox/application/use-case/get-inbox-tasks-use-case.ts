import { GetInboxTasks } from '@/feature/inbox/application/port/in/get-inbox-tasks';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { Task } from '@/shared/feature/task/entity/task';
import { TaskApi } from '@/shared/feature/task/application/port/out/task-api';

export class GetInboxTasksUseCase implements GetInboxTasks {
    constructor(
        private readonly taskApi: TaskApi
    ) { }

    async execute(): AsyncResult<string, Task[]> {
        try {
            const res = await this.taskApi.getInbox();
            return ok(res);
        } catch (error: unknown) {
            return nok(error instanceof Error ? error.message : 'Error fetching inbox tasks');
        }
    }
}
