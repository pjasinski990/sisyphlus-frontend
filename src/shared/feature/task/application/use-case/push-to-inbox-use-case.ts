import { PushToInbox } from '@/shared/feature/task/application/port/in/push-to-inbox';
import { Task } from '../../entity/task';
import { TaskApi } from '@/shared/feature/task/application/port/out/task-api';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';

export class PushToInboxUseCase implements PushToInbox {
    constructor(
        private readonly api: TaskApi
    ) {}

    async execute(task: Task): AsyncResult<string, Task> {
        try {
            const res =  await this.api.create(task);
            return ok(res);
        } catch (error: unknown) {
            if (error instanceof Error) {
                return nok(error.message);
            } else {
                return nok('Unknown error pushing to inbox');
            }
        }
    }
}
