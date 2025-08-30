import { ScheduleBlockDesc } from '@/feature/day-plan/entity/schedule-block-description';
import { Block } from '@/feature/day-plan/entity/block';
import { TimeblockApi } from '@/feature/day-plan/application/port/out/timeblock-api';
import { httpClient } from '@/shared/feature/http/infra/fetch-http-client';

export class HttpTimeblockApi implements TimeblockApi {
    async create(desc: ScheduleBlockDesc): Promise<Block> {
        const res = await httpClient.post<Block>('/timeblock', desc);
        return res.data;
    }

    async update(patch: Partial<Block> & { id: string }): Promise<Block> {
        const res = await httpClient.put<Block>('/timeblock', patch);
        return res.data;
    }

    async remove(blockId: string): Promise<Block> {
        const res = await httpClient.delete<Block>(`/timeblock/${blockId}`);
        return res.data;
    }

    async getByLocalDate(localDate: string): Promise<Block[]> {
        const res = await httpClient.get<Block[]>(`/timeblock/${localDate}`);
        return res.data;
    }

    async getByIds(ids: string[]): Promise<Block[]> {
        const params = new URLSearchParams();
        ids.forEach(id => params.append('ids', id));

        const url = `/timeblock?${params.toString()}`;
        const res = await httpClient.get<Block[]>(url);
        return res.data;
    }
}
