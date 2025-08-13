export type TaskCategory = 'simple' | 'recurring';
export type TaskStatus = 'todo' | 'done' | 'archived';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type FlowStatus = 'active' | 'paused' | 'archived';

export interface BaseTask {
    id: string;
    userId: string;
    title: string;
    category: TaskCategory;
    description?: string;
    dod?: string;
    energy: EnergyLevel;
    estimatedMin?: number;
    spentMin?: number;
    tags: string[];
    context?: string;
    createdAt: string;  // iso
    updatedAt: string;  // iso
    parentId?: string;
    anchor?: Anchor;
}

export interface SimpleTask extends BaseTask {
    category: 'simple';
    status: TaskStatus;
    finishedAt?: string;
}

export interface RecurringTask extends BaseTask {
    category: 'recurring';
    status: FlowStatus;
    schedule: Schedule;
    defaultDurationMin?: number;
    preferredWindow?: { from: string; to: string };     // HH:mm
}

export type Task = SimpleTask | RecurringTask;

export interface Schedule {
    rrule: string;              // icalendar - rfc 5545
    timezone: string;           // eg. 'Europe/Warsaw'
    additionalDates: string[];  // YYYY-MM-DD
    excludedDates: string[];    // YYYY-MM-DD
    beginDate: string;          // YYYY-MM-DD
    untilDate?: string;         // YYYY-MM-DD
}

export type AnchorType = 'task' | 'tag';
export type AnchorCategory = 'after' | 'before';

export interface BaseAnchor {
    type: AnchorType;
    anchorCategory: AnchorCategory;
    timeOffsetMin: number;
}

export interface TaskAnchor extends BaseAnchor {
    type: 'task';
    taskId: string;
}

export interface TagAnchor extends BaseAnchor {
    type: 'tag';
    tag: string;
}

export type Anchor = TaskAnchor | TagAnchor;

export type PlannedTaskStatus = 'planned' | 'completed' | 'skipped';

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
