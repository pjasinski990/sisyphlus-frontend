import { Range } from '@/shared/feature/util/range';

export type TimeOfDay = `${number}:${number}`;

export interface Task {
    timespan: Range<TimeOfDay>;
    title: string;
}
