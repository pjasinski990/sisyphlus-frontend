import { registerDialogTemplate } from './DialogTemplate';
import { ConfirmDialog } from '@/shared/feature/dialog/infra/web/react/templates/ConfirmDialog';

export function registerDefaultDialogs() {
    registerDialogTemplate('confirm', ConfirmDialog);
}
