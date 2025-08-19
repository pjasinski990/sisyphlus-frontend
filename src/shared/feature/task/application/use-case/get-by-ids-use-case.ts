import { GetByIds } from '@/shared/feature/task/application/port/in/get-by-ids';
import { InboxApi } from '@/shared/feature/task/application/port/out/inbox-api';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { Task } from '@/shared/feature/task/entity/task';

export class GetByIdsUseCase implements GetByIds {
    constructor(
        private readonly taskApi: InboxApi
    ) { }

    async execute(ids: string[]): AsyncResult<string, Task[]> {
        try {
            const res = await this.taskApi.getByIds(ids);
            return ok(res);
        } catch (error: unknown) {
            return nok(error instanceof Error ? error.message : 'Error fetching tasks');
        }
    }
}
