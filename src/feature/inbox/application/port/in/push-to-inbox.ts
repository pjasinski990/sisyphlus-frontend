import { Task } from '@/shared/feature/task/entity/task';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface PushToInbox {
    execute(task: Task): AsyncResult<string, Task>;
}
