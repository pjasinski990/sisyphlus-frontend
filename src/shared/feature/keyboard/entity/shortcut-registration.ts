import { ShortcutBindings } from '@/shared/feature/keyboard/entity/shortcut-bindings';

export interface ShortcutRegistration {
    id: string;
    scopeId: string;
    bindings: ShortcutBindings;
    ignoreTyping?: boolean;
    preventDefault?: boolean;
}
