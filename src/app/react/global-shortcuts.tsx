import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';
import { useDialog } from '@/shared/feature/dialog/infra/web/react/useDialog';
import { useShortcut } from '@/shared/feature/keyboard/infra/web/react/useShortcut';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { openCommandPalette } from '../shortcut-handlers/open-command-pallete';
import { openShortcutsHelp } from '@/app/shortcut-handlers/open-shortcuts-help';

export function GlobalShortcuts() {
    useShortcutScope('global', true);
    const { closeTop } = useDialog();
    useShortcut('global', [
        { combo: 'char:/', handler: openCommandPalette, description: 'Open Command Palette', group: 'Navigation' },
        { combo: 'char:?', handler: openShortcutsHelp, description: 'Open shortcuts help', group: 'Help' },
        { combo: 'Escape', handler: closeTop, description: 'Dismiss dialog', group: 'Navigation' },
        { combo: 'Enter', handler: resolveTopDialog, description: 'Resolve dialog', group: 'Navigation' },
    ]);
    return null;
}

function resolveTopDialog() {
    const topDialog = dialogController.handleGetRegistry().getTop();
    if (topDialog) {
        return dialogController.handleResolve(topDialog.id);
    }
}
