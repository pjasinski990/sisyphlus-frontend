export interface ScheduleBlockBaseDesc {
    startLocalDate: string,
    startLocalTime: string,
    duration: string,
    timezone: string,
}

export interface ScheduleTaskBlockDesc extends ScheduleBlockBaseDesc {
    taskId: string,
    tag?: never,
}

export interface ScheduleTagBlockDesc extends ScheduleBlockBaseDesc {
    taskId?: never,
    tag: string,
}

export type ScheduleBlockDesc = ScheduleTagBlockDesc | ScheduleTaskBlockDesc;
