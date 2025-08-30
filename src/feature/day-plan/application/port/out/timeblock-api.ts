import { Block } from '@/feature/day-plan/entity/block';
import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';

export interface TimeblockApi {
    create(desc: ScheduleBlockDesc): Promise<Block>;
    update(patch: Partial<Block> & { id: string }): Promise<Block>;
    remove(blockId: string): Promise<Block>;
    getByLocalDate(localDate: string): Promise<Block[]>;
    getByIds(ids: string[]): Promise<Block[]>;
}
