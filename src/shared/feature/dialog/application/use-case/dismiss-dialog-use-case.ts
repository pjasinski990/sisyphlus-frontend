import { DismissDialog } from '../port/in/dismiss-dialog';
import { DialogRegistry } from '../port/out/dialog-registry';

export class DismissDialogUseCase implements DismissDialog {
    constructor(private readonly reg: DialogRegistry) {}

    execute(id: string): void {
        this.reg.takeDeferred(id)?.resolve(undefined);
        this.reg.remove(id);
    }
}
