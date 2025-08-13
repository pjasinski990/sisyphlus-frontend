import { GroupedShortcuts } from '@/shared/feature/keyboard/entity/listed-shortcut';

export interface ListShortcuts {
    listShortcutsByScope(): GroupedShortcuts;
}
