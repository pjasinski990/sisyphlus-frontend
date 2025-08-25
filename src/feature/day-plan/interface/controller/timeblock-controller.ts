import { ScheduleTimeblock } from '@/feature/day-plan/application/port/in/schedule-timeblock';
import { Block } from '../../entity/block';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';
import { ScheduleTimeblockUseCase } from '@/feature/day-plan/application/use-case/schedule-timeblock-use-case';
import { HttpTimeblockApi } from '@/feature/day-plan/infra/http-timeblock-api';
import { GetDayTimeblocks } from '@/feature/day-plan/application/port/in/get-day-timeblocks';
import { GetDayTimeblocksUseCase } from '@/feature/day-plan/application/use-case/get-day-timeblocks-use-case';
import { GetTimeblocksByIds } from '../../application/port/in/get-timeblocks-by-ids';
import { GetTimeblocksByIdsUseCase } from '@/feature/day-plan/application/use-case/get-timeblocks-by-ids-use-case';
import { UpdateTimeblock } from '../../application/port/in/update-timeblock';
import { UpdateTimeblockUseCase } from '@/feature/day-plan/application/use-case/update-timeblock-use-case';

export class TimeblockController {
    constructor(
        private readonly scheduleTimeblock: ScheduleTimeblock,
        private readonly updateTimeblock: UpdateTimeblock,
        private readonly getDayTimeblocks: GetDayTimeblocks,
        private readonly getTimeblocksByIds: GetTimeblocksByIds,
    ) { }

    handleSchedule(desc: ScheduleBlockDesc): AsyncResult<string, Block> {
        return this.scheduleTimeblock.execute(desc);
    }

    handleUpdate(patch: Partial<Block> & { id: string }): AsyncResult<string, Block> {
        return this.updateTimeblock.execute(patch);
    }

    handleGetDayTimeblocks(localDate: string): AsyncResult<string, Block[]> {
        return this.getDayTimeblocks.execute(localDate);
    }

    handleGetByIds(ids: string[]): AsyncResult<string, Block[]> {
        return this.getTimeblocksByIds.execute(ids);
    }
}

const timeblockApi = new HttpTimeblockApi();
const scheduleTimeblock = new ScheduleTimeblockUseCase(timeblockApi);
const updateTimeblock = new UpdateTimeblockUseCase(timeblockApi);
const getDayTimeblocks = new GetDayTimeblocksUseCase(timeblockApi);
const getBlocksByIds = new GetTimeblocksByIdsUseCase(timeblockApi);

export const timeblockController = new TimeblockController(
    scheduleTimeblock,
    updateTimeblock,
    getDayTimeblocks,
    getBlocksByIds,
);
