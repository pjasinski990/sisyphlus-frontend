import { Command } from '@/shared/feature/command-palette/entity/command';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export interface CommandRegistry {
    add(cmd: Command): void;
    remove(id: string): void;
    getById(id: string): Command | null;
    getByAlias(alias: string): Command | null;
    list(): ListedCommand[];
    aliases(): Map<string, string>;
}
