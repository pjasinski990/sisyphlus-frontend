import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { Task } from '@/shared/feature/task/entity/task';

export interface GetInboxTasks {
    execute(): AsyncResult<string, Task[]>;
}
