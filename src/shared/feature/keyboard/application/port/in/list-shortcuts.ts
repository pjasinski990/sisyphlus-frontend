import { GroupedShortcuts } from '../out/shortcut-registry';

export interface ListShortcuts {
    listShortcutsByScope(): GroupedShortcuts;
}
