import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';

export interface ListCommands {
    execute(context?: CommandContext): ListedCommand[];
}
