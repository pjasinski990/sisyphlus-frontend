export type TaskCategory = 'simple' | 'recurring' | 'anchored';
export type TaskStatus = 'todo' | 'finished' | 'archived';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type UnfinishableStatus = 'active' | 'paused' | 'archived';

export interface BaseTask {
    id: string;
    userId: string;
    title: string;
    category: TaskCategory;
    description?: string;
    dod?: string;
    energy: EnergyLevel;
    minutesEstimated: number;
    tags: string[];
    context?: string;
    progressNotes: ProgressNote[];
    createdAt: Date;
    updatedAt: Date;
    parentId?: string;
}

export interface ProgressNote {
    blockId: string;
    at: string;
    note: string;
}

export interface Schedule {
    recurrenceRule: string,
    additionalDates: Date[],
    excludedDates: Date[],
    beginDate: Date,
    untilDate?: Date;
}

export type AnchorType = 'task' | 'tag';
export type AnchorCategory = 'after' | 'before';

export interface BaseAnchor {
    type: AnchorType;
    anchorCategory: AnchorCategory;
    timeOffset: number;
}

export interface TaskAnchor extends BaseAnchor{
    type: 'task';
    taskId: string;
}

export interface TagAnchor extends BaseAnchor {
    type: 'tag';
    tag: string;
}

export type Anchor = TaskAnchor | TagAnchor;

export interface AnchoredTask extends BaseTask {
    category: 'anchored';
    status: UnfinishableStatus;
    anchor: Anchor;
}

export interface SimpleTask extends BaseTask {
    category: 'simple';
    status: TaskStatus;
    minutesSpent: number;
    finishedAt: Date;
}

export interface RecurringTask extends BaseTask {
    category: 'recurring';
    status: UnfinishableStatus;
    schedule: Schedule;
}

export interface BaseBlock {
    id: string;
    userId: string;
    energy: EnergyLevel;
    startAt: string;
    finishedAt?: string;
    cancelledAt?: string;
    duration?: number;
}

export interface TaskBlock extends BaseBlock {
    taskId: string;
}

export interface TagBlock extends BaseBlock {
    tag: string;
}

export type Task = SimpleTask | RecurringTask | AnchoredTask;
export type Block = TaskBlock | TagBlock;

export type DayPlanTaskStatus = 'planned' | 'carried_over' | 'finished' | 'skipped';

export interface DayPlanEntry {
    taskId: string,
    order: number;
    source: DayPlanTaskStatus;
}

export interface DayPlan {
    date: Date;
    keyTaskId?: string;
    entries: DayPlanEntry[];
}
