import { ShortcutHandler } from '@/shared/feature/keyboard/entity/shortcut-handler';

export interface ShortcutBinding {
    combos: string[];
    handler: ShortcutHandler;
    // TODO change to reactnode, style descriptions to include special tokens (inbox, today...)
    description: string;
    group?: string;
}
