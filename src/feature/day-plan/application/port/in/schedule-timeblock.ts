import { Block } from '@/feature/day-plan/entity/block';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';

export interface ScheduleTimeblock {
    execute(desc: ScheduleBlockDesc): AsyncResult<string, Block>;
}
