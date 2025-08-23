export interface BaseBlock {
    id: string;
    category: 'task-block' | 'tag-block';
    userId: string;

    localDate: string;  // YYYY-MM-DD
    localTime: string;  // HH:mm
    timezone: string;   // IANA eg. 'Europe/Warsaw'

    startUtc: string;   // iso 8601 instant
    duration: string;   // iso duration
    endUtc: string;     // iso 8601 instant

    cancelledAt?: string;    // iso 8601 instant
    completedAt?: string;    // iso 8601 instant

    progressNote?: string;
    artifactUrl?: string;

    recurrenceInstanceId?: string;

    createdAt?: string;  // iso 8601 instant
    updatedAt?: string;  // iso 8601 instant
}

export interface TaskBlock extends BaseBlock {
    category: 'task-block';
    taskId: string;
    tag?: never;
}

export interface TagBlock extends BaseBlock {
    category: 'tag-block';
    tag: string;
    taskId?: never;
    resolvedTaskId?: string;
}

export type Block = TaskBlock | TagBlock;
