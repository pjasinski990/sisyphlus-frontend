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

export class TimeblockController {
    constructor(
        private readonly scheduleTimeblock: ScheduleTimeblock,
        private readonly getDayTimeblocks: GetDayTimeblocks,
        private readonly getTimeblocksByIds: GetTimeblocksByIds,
    ) { }

    handleScheduleTimeblock(desc: ScheduleBlockDesc): AsyncResult<string, Block> {
        return this.scheduleTimeblock.execute(desc);
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
const getDayTimeblocks = new GetDayTimeblocksUseCase(timeblockApi);
const getBlocksByIds = new GetTimeblocksByIdsUseCase(timeblockApi);

export const timeblockController = new TimeblockController(
    scheduleTimeblock,
    getDayTimeblocks,
    getBlocksByIds,
)
