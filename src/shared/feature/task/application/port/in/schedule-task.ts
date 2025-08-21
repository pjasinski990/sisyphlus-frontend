import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { Changeset } from '@/shared/feature/local-state/entity/changeset';

export interface ScheduleTask {
    execute(localDate: string, taskId: string): AsyncResult<string, Changeset>;
}
