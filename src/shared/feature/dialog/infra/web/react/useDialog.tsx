import { useMemo } from 'react';
import { dialogController } from '../../controllers/dialog-controller';

export function useDialog() {
    return useMemo(
        () => ({
            open: dialogController.handleOpen,
            resolve: dialogController.handleResolve,
            dismiss: dialogController.handleDismiss,
            closeTop: dialogController.handleCloseTop,
        }),
        []
    );
}
