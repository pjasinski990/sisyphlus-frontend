import { useEffect, useMemo } from 'react';
import { useKeyboardController } from './KeyboardProvider';
import { ShortcutBinding } from '../../../entity/shortcut-binding';

export function useShortcut(
    scopeId: string,
    bindings: ShortcutBinding[],
    opts?: { ignoreTyping?: boolean; preventDefault?: boolean }
) {
    const controller = useKeyboardController();

    const stableBindings = useMemo(
        () => bindings,
        [bindings]
    );

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
