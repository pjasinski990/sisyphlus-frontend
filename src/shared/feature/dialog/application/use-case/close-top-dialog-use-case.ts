import { CloseTopDialog } from '../port/in/close-top-dialog';
import { DialogRegistry } from '../port/out/dialog-registry';

export class CloseTopUseCase implements CloseTopDialog {
    constructor(private readonly reg: DialogRegistry) {}

    execute(): void {
        const top = this.reg.getTop();
        if (!top) return;
        this.reg.takeDeferred(top.id)?.resolve(undefined);
        this.reg.remove(top.id);
    }
}
