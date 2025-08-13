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
