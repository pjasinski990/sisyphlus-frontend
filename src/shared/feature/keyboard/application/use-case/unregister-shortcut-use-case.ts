import { UnregisterShortcut } from '@/shared/feature/keyboard/application/port/in/unregister-shortcut';
import { RegisterShortcutUseCase } from '@/shared/feature/keyboard/application/use-case/register-shortcut-use-case';

export class UnregisterShortcutUseCase implements UnregisterShortcut {
    constructor(private readonly registry: RegisterShortcutUseCase) {}
    unregisterShortcut(id: string): void {
        this.registry.unregister(id);
    }
}
