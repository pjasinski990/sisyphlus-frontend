import { registerDialogTemplate } from './DialogTemplate';
import { ConfirmDialog } from '@/shared/feature/dialog/infra/web/react/templates/ConfirmDialog';
import { InfoDialog } from '@/shared/feature/dialog/infra/web/react/templates/InfoDialog';
import { CustomDialog } from '@/shared/feature/dialog/infra/web/react/templates/CustomDialog';

export function registerDefaultDialogs() {
    registerDialogTemplate('custom', CustomDialog);
    registerDialogTemplate('confirm', ConfirmDialog);
    registerDialogTemplate('info', InfoDialog);
}
