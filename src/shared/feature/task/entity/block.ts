import { EnergyLevel } from '@/shared/feature/task/entity/task';

export interface BaseBlock {
    id: string;
    userId: string;
    energy: EnergyLevel;

    startAt: string;    // iso
    endAt: string;      // iso
    timezone: string;   // eg. 'Europe/Warsaw'
    localDate: string;  // YYYY-MM-DD
    plannedDurationMin: number;

    cancelledAt?: string;    // iso
    completedAt?: string;    // iso
    actualDurationMin?: number;

    progressNote?: string;
    artifactUrl?: string;

    sourceRecurringTaskId: string;
    recurrenceInstanceId?: string;

    createdAt: string;  // iso
    updatedAt: string;  // iso
}

export interface TaskBlock extends BaseBlock {
    taskId: string;
    tag?: never;
}

export interface TagBlock extends BaseBlock {
    tag: string;
    taskId?: never;
    resolvedTaskId?: string;
}

export type Block = TaskBlock | TagBlock;
