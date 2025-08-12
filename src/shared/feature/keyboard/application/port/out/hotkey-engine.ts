import { ShortcutBinding } from '../../../entity/shortcut-binding';

export interface HotkeyEngineHandle { dispose(): void; }

export interface HotkeyEngine {
    register(
        bindings: ShortcutBinding[],
        opts: {
            guard?: (e: KeyboardEvent) => boolean;
            preventDefault?: boolean;
            target?: Window | HTMLElement;
        }
    ): HotkeyEngineHandle;
}
