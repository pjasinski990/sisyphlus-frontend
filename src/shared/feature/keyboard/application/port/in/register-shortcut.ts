import { ShortcutRegistration } from '../../../entity/shortcut-registration';

export interface RegisterShortcut {
    registerShortcut(reg: Omit<ShortcutRegistration, 'id'>): string;
}
