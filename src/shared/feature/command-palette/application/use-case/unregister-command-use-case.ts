import { UnregisterCommand } from '@/shared/feature/command-palette/application/port/in/unregister-command';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';

export class UnregisterCommandUseCase implements UnregisterCommand {
    constructor(private readonly registry: CommandRegistry) {}
    unregister(id: string): void {
        this.registry.remove(id);
    }
}
