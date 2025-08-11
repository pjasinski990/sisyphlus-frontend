import { EnableScope } from '../port/in/enable-scope';
import { ScopeManager } from '@/shared/feature/keyboard/entity/scope-manager';

export class EnableScopeUseCase implements EnableScope {
    constructor(private readonly scopes: ScopeManager) {}
    enableScope(id: string): void {
        this.scopes.enable(id);
    }
}
