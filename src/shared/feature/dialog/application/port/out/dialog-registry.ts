import { DialogInstance } from '../../../entity/dialog-instance';
import { DialogState } from '../../../entity/dialog-state';

export interface DialogRegistry {
    getState(): DialogState;
    subscribe(cb: (s: DialogState) => void): () => void;

    push(instance: DialogInstance): void;
    remove(id: string): void;
    findById(id: string): DialogInstance | undefined;

    createDeferred(id: string): {
        promise: Promise<unknown>;
        resolve: (v?: unknown) => void;
        reject: (r?: unknown) => void;
    };
    takeDeferred(id: string):
        | { resolve: (v?: unknown) => void; reject: (r?: unknown) => void }
        | undefined;

    getTop(): DialogInstance | undefined;
}
