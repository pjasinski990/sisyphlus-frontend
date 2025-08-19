import { useShortcutScope } from '@/shared/feature/keyboard/infra/web/react/useShortcutScope';
import { useDialog } from '@/shared/feature/dialog/infra/web/react/useDialog';
import { useShortcut } from '@/shared/feature/keyboard/infra/web/react/useShortcut';
import { dialogController } from '@/shared/feature/dialog/infra/controllers/dialog-controller';
import { openCommandPalette } from '../shortcut-handlers/open-command-pallete';
import { openShortcutsHelp } from '@/app/shortcut-handlers/open-shortcuts-help';
import { openInbox } from '@/feature/inbox/interface/web/react/Inbox';

// TODO move component-specific shortcuts - eg. register openInbox in inbox, add task in palette (pull withCommand from alias)
export function GlobalShortcuts() {
    useShortcutScope('global', true);
    useShortcut('global', [
        { combos: ['Control+K', 'Meta+K'], handler: () => openCommandPalette(''), description: 'Open Command Palette', group: 'Navigation' },
        { combos: ['char:?'], handler: openShortcutsHelp, description: 'Open shortcuts help', group: 'Help' },
        { combos: ['I'], handler: openInbox, description: 'Open Inbox', group: 'Navigation' },
        { combos: ['A'], handler: () => openCommandPalette('in '), description: 'Add to Inbox', group: 'Navigation' },
    ]);
    return null;
}

export function DialogShortcuts() {
    const { closeTop } = useDialog();
    useShortcutScope('global', true);
    useShortcut('modal', [
        { combos: ['Escape'], handler: closeTop, description: 'Dismiss dialog', group: 'Navigation' },
        { combos: ['Enter'], handler: resolveTopDialog, description: 'Resolve dialog', group: 'Navigation' },
    ]);
    return null;
}

function resolveTopDialog() {
    const topDialog = dialogController.handleGetRegistry().getTop();
    if (topDialog) {
        return dialogController.handleResolve(topDialog.id);
    }
}
