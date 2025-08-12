import { GroupedShortcuts, ListedShortcut } from '@/shared/feature/keyboard/entity/listed-shortcut';

export interface ShortcutRegistry {
    addMany(items: ListedShortcut[]): void;
    removeByRegistration(registrationId: string): void;
    snapshotGroupedByScope(): GroupedShortcuts;
}
