export type ChangesetItem =
    | {
        kind: 'collection';
        collection: string;           // e.g., 'task', 'dayPlan'
        upsert?: unknown[];           // raw payloads
        remove?: string[];            // ids
    }
    | {
        kind: 'event';
        type: string;                 // e.g., 'PlanEntryAdded'
        payload: unknown;             // event payload
    };

export type Changeset = ChangesetItem[];
