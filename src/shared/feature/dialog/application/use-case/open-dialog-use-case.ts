import { OpenDialog, OpenDialogCommand } from '../port/in/open-dialog';
import { DialogRegistry } from '../port/out/dialog-registry';
import { v4 as uuid } from 'uuid';
import { CenteredDialogOptions, DialogInstance } from '@/shared/feature/dialog/entity/dialog-instance';

export class OpenDialogUseCase implements OpenDialog {
    constructor(private readonly reg: DialogRegistry) {}
    async execute<T = unknown>(cmd: OpenDialogCommand): Promise<T | undefined> {
        const id = uuid();
        const options = cmd.options ?? getDefaultOptions();
        if (!options.zIndex) {
            options.zIndex = 50;
        }

        this.reg.push({
            id,
            key: cmd.key,
            payload: cmd.payload ?? {},
            dismissible: options.dismissible ?? true,
            options,
        } as DialogInstance);

        const { promise } = this.reg.createDeferred(id);
        const result = await promise;
        return result as T | undefined;
    }
}

function getDefaultOptions(): CenteredDialogOptions {
    return {
        variant: 'centered',
        modal: true,
        dismissible: true,
        zIndex: 50,
    };
}
