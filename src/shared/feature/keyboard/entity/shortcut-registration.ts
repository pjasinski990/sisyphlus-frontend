import { ShortcutBinding } from '@/shared/feature/keyboard/entity/shortcut-binding';

export interface ShortcutRegistration {
    id: string;
    scopeId: string;
    bindings: ShortcutBinding[];
    ignoreTyping?: boolean;
    preventDefault?: boolean;
}
