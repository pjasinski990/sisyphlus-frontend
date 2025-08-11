import { ShortcutBindings } from '../../../entity/shortcut-bindings';

export interface HotkeyEngineHandle {
    dispose(): void;
}

export interface HotkeyEngine {
    register(
        bindings: ShortcutBindings,
        opts: {
            guard?: (e: KeyboardEvent) => boolean;
            preventDefault?: boolean;
            target?: Window | HTMLElement;
        }
    ): HotkeyEngineHandle;
}
