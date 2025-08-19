import { Task } from '@/shared/feature/task/entity/task';
import { AsyncResult } from '@/shared/feature/auth/entity/result';

export interface GetByIds {
    execute(ids: string[]): AsyncResult<string, Task[]>;
}
