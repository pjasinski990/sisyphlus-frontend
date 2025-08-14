import { Command } from '@/shared/feature/command-palette/entity/command';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export interface CommandRegistry {
    add(cmd: Command<unknown>): void;
    remove(id: string): void;
    getById(id: string): Command<unknown> | null;
    getByAlias(alias: string): Command<unknown> | null;
    list(): ListedCommand[];
    aliases(): Map<string, string>;
}
