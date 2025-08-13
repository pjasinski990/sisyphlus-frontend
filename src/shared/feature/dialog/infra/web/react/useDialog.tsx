import { useMemo } from 'react';
import { dialogController } from '../../controllers/dialog-controller';

export function useDialog() {
    const c = dialogController;
    return useMemo(
        () => ({
            open: (cmd: Parameters<typeof c.handleOpen>[0]) => c.handleOpen(cmd),
            resolve: (id: string, result?: unknown) => c.handleResolve(id, result),
            dismiss: (id: string) => c.handleDismiss(id),
            closeTop: () => c.handleCloseTop(),
        }),
        [c]
    );
}
