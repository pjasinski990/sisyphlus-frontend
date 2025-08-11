export type TaskStatus =
    | 'todo'
    | 'done';

export type EnergyLevel =
    | 'low'
    | 'medium'
    | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    energy: EnergyLevel;
    minute_estimated: number;
    minutes_spent: number;
    tags: string[];
    parent_id: string | null;
    isKey: boolean;
}
