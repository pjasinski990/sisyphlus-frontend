import { registerDialogTemplate } from './DialogTemplate';
import { ConfirmDialog } from '@/shared/feature/dialog/infra/web/react/templates/ConfirmDialog';
import { InfoDialog } from '@/shared/feature/dialog/infra/web/react/templates/InfoDialog';
import { CustomDialog } from '@/shared/feature/dialog/infra/web/react/templates/CustomDialog';
import { ContextMenuDialog } from '@/shared/feature/dialog/infra/web/react/templates/ContextMenuDialog';

export function registerDefaultDialogs() {
    registerDialogTemplate('custom', CustomDialog);
    registerDialogTemplate('confirm', ConfirmDialog);
    registerDialogTemplate('info', InfoDialog);
    registerDialogTemplate('context-menu', ContextMenuDialog);
}
