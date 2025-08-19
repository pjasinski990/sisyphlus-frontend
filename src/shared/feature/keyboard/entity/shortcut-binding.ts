import { ShortcutHandler } from '@/shared/feature/keyboard/entity/shortcut-handler';

export interface ShortcutBinding {
    combos: string[];
    handler: ShortcutHandler;
    description: string;
    group?: string;
}
