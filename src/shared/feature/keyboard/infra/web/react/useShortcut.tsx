import { useEffect, useMemo } from 'react';
import { useKeyboardController } from './KeyboardProvider';
import { ShortcutBindings } from '../../../entity/shortcut-bindings';

export function useShortcut(
    scopeId: string,
    bindings: ShortcutBindings,
    opts?: { ignoreTyping?: boolean; preventDefault?: boolean }
) {
    const controller = useKeyboardController();
    const stableBindings = useMemo(() => bindings, [bindings]);

    useEffect(() => {
        const id = controller.handleRegisterShortcut({
            scopeId,
            bindings: stableBindings,
            ignoreTyping: opts?.ignoreTyping ?? true,
            preventDefault: opts?.preventDefault ?? true,
        });
        return () => controller.handleUnregisterShortcut(id);
    }, [controller, stableBindings, opts?.ignoreTyping, opts?.preventDefault, scopeId]);
}
