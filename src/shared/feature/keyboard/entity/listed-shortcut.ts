export interface ListedShortcut {
    registrationId: string;
    scopeId: string;
    combos: string[];
    description: string;
    group?: string;
}

export type GroupedShortcuts = Record<string, ListedShortcut[]>;
