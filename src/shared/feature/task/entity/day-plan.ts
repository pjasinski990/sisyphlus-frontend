export type PlannedTaskStatus = 'planned' | 'completed' | 'skipped';

export interface DayPlanEntry {
    id: string;
    taskId: string;
    order: number;  // fractional indexing
    status: PlannedTaskStatus;
    carryoverFrom?: string;     // YYYY-MM-DD
}

export interface DayPlan {
    userId: string;
    localDate: string;  // YYYY-MM-DD
    keyTaskId?: string;
    entries: DayPlanEntry[];

    createdAt: string;  // iso
    updatedAt: string;  // iso
}
