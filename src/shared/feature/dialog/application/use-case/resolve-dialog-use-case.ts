import { ResolveDialog } from '../port/in/resolve-dialog';
import { DialogRegistry } from '../port/out/dialog-registry';

export class ResolveDialogUseCase implements ResolveDialog {
    constructor(private readonly reg: DialogRegistry) {}

    execute(id: string, result?: unknown): void {
        this.reg.takeDeferred(id)?.resolve(result);
        this.reg.remove(id);
    }
}
