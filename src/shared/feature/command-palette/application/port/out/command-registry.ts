import { Command } from '@/shared/feature/command-palette/entity/command';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export interface CommandRegistry {
    add<TParsed, TArgs>(cmd: Command<TParsed, TArgs>): void;
    remove(id: string): void;
    getById(id: string): Command<unknown, unknown> | null;
    getByAlias(alias: string): Command<unknown, unknown> | null;
    list(): ListedCommand[];
    aliases(): Map<string, string>;
}
