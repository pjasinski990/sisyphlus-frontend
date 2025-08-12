import { OpenDialogUseCase } from '../../application/use-case/open-dialog-use-case';
import { ResolveDialogUseCase } from '../../application/use-case/resolve-dialog-use-case';
import { DismissDialogUseCase } from '../../application/use-case/dismiss-dialog-use-case';
import { CloseTopUseCase } from '../../application/use-case/close-top-dialog-use-case';
import { InMemoryDialogRegistry } from '../providers/in-memory-dialog-registry';
import { IncrementalIdGenerator } from '../providers/incremental-id-generator';
import { OpenDialog, OpenDialogCommand } from '../../application/port/in/open-dialog';
import { DismissDialog } from '../../application/port/in/dismiss-dialog';
import { ResolveDialog } from '../../application/port/in/resolve-dialog';
import { CloseTopDialog } from '../../application/port/in/close-top-dialog';
import { DialogRegistry } from '../../application/port/out/dialog-registry';
import { IdGenerator } from '../../application/port/out/id-generator';

export class DialogController {
    constructor(
        private readonly registry: DialogRegistry,
        private readonly ids: IdGenerator,
        private readonly open: OpenDialog,
        private readonly resolve: ResolveDialog,
        private readonly dismiss: DismissDialog,
        private readonly closeTop: CloseTopDialog,
    ) { }

    handleOpen<T>(cmd: OpenDialogCommand) {
        return this.open.execute<T>(cmd);
    }

    handleResolve(id: string, result?: unknown) {
        return this.resolve.execute(id, result);
    }

    handleDismiss(id: string) {
        return this.dismiss.execute(id);
    }

    handleCloseTop() {
        return this.closeTop.execute();
    }

    handleGetRegistry() {
        return this.registry;
    }
}

const registry = new InMemoryDialogRegistry();
const ids = new IncrementalIdGenerator();
const open = new OpenDialogUseCase(registry, ids);
const resolve = new ResolveDialogUseCase(registry);
const dismiss = new DismissDialogUseCase(registry);
const closeTop = new CloseTopUseCase(registry);

export const dialogController = new DialogController(
    registry,
    ids,
    open,
    resolve,
    dismiss,
    closeTop,
);
