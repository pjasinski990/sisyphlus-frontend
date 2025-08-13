import { Schedule } from '@/shared/feature/task/entity/schedule';
import { Anchor } from '@/shared/feature/task/entity/anchor';

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
