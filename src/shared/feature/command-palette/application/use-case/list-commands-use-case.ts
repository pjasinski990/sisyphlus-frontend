import { ListCommands } from '@/shared/feature/command-palette/application/port/in/list-commands';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';

export class ListCommandsUseCase implements ListCommands {
    constructor(private readonly registry: CommandRegistry) {}
    execute(context?: CommandContext): ListedCommand[] {
        const scope = context?.scope ?? 'global';
        let res = this.registry.list()
        res = res.filter(c => c.scope === scope);
        return res;
    }
}
