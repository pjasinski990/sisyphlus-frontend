import { OpenDialog, OpenDialogCommand } from '../port/in/open-dialog';
import { DialogRegistry } from '../port/out/dialog-registry';
import { v4 as uuid } from 'uuid';

export class OpenDialogUseCase implements OpenDialog {
    constructor(private readonly reg: DialogRegistry) {}

    async execute<T = unknown>(cmd: OpenDialogCommand): Promise<T | undefined> {
        const id = uuid();
        this.reg.push({
            id,
            key: cmd.key,
            payload: cmd.payload ?? {},
            modal: cmd.options?.modal ?? true,
            dismissible: cmd.options?.dismissible ?? true,
            zIndex: cmd.options?.zIndex,
        });

        const { promise } = this.reg.createDeferred(id);
        const result = await promise;
        return result as T | undefined;
    }
}
