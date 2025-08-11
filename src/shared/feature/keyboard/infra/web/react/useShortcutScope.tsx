import { useEffect } from 'react';
import { useKeyboardController } from './KeyboardProvider';

export function useShortcutScope(scopeId: string, enabled: boolean = true) {
    const controller = useKeyboardController();

    useEffect(() => {
        if (enabled) controller.handleEnableScope(scopeId);
        else controller.handleDisableScope(scopeId);
        return () => controller.handleDisableScope(scopeId);
    }, [controller, scopeId, enabled]);
}
