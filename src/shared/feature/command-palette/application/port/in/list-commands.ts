import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export interface ListCommands {
    execute(): ListedCommand[];
}
