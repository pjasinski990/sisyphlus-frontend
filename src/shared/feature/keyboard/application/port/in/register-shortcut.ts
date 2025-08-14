import { ShortcutRegistration } from '../../../entity/shortcut-registration';

export interface RegisterShortcut {
    // TODO provide id
    registerShortcut(reg: Omit<ShortcutRegistration, 'id'>): string;
}
