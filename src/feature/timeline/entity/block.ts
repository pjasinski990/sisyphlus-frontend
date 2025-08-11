import { Range } from '@/shared/util/range';

export type TimeOfDay = `${number}:${number}`;

export interface Block {
    id: string;
    timespan: Range<TimeOfDay>;
    title: string;
}
