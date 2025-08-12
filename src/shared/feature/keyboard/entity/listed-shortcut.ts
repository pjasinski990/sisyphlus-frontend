export interface ListedShortcut {
    registrationId: string;
    scopeId: string;
    combo: string;
    description: string;
    group?: string;
}

export type GroupedShortcuts = Record<string, ListedShortcut[]>;
