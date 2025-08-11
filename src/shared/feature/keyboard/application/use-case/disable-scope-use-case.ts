import { DisableScope } from '../port/in/disable-scope';
import { ScopeManager } from '@/shared/feature/keyboard/entity/scope-manager';

export class DisableScopeUseCase implements DisableScope {
    constructor(private readonly scopes: ScopeManager) {}
    disableScope(id: string): void {
        this.scopes.disable(id);
    }
}
