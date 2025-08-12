import { DialogRegistry } from '../../application/port/out/dialog-registry';
import { DialogInstance } from '../../entity/dialog-instance';
import { DialogState } from '../../entity/dialog-state';

export class InMemoryDialogRegistry implements DialogRegistry {
    private state: DialogState = { stack: [] };
    private subs = new Set<(s: DialogState) => void>();
    private deferred = new Map<string, { resolve: (v?: unknown) => void; reject: (r?: unknown) => void }>();

    getState(): DialogState {
        return this.state;
    }

    subscribe(cb: (s: DialogState) => void): () => void {
        this.subs.add(cb);
        cb(this.state);
        return () => this.subs.delete(cb);
    }

    private emit() {
        for (const cb of this.subs) cb(this.state);
    }

    push(instance: DialogInstance): void {
        this.state = { stack: [...this.state.stack, instance] };
        this.emit();
    }

    remove(id: string): void {
        this.state = { stack: this.state.stack.filter(d => d.id !== id) };
        this.emit();
    }

    findById(id: string): DialogInstance | undefined {
        return this.state.stack.find(d => d.id === id);
    }

    getTop(): DialogInstance | undefined {
        const s = this.state.stack;
        return s.length ? s[s.length - 1] : undefined;
    }

    createDeferred(id: string) {
        let resolve!: (v?: unknown) => void;
        let reject!: (r?: unknown) => void;
        const promise = new Promise<unknown>((res, rej) => {
            resolve = res;
            reject = rej;
        });
        this.deferred.set(id, { resolve, reject });
        return { promise, resolve, reject };
    }

    takeDeferred(id: string) {
        const d = this.deferred.get(id);
        this.deferred.delete(id);
        return d;
    }
}
