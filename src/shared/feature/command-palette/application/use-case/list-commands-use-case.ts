import { ListCommands } from '@/shared/feature/command-palette/application/port/in/list-commands';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export class ListCommandsUseCase implements ListCommands {
    constructor(private readonly registry: CommandRegistry) {}
    list(): ListedCommand[] {
        return this.registry.list();
    }
}
