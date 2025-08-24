import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { Command } from '@/shared/feature/command-palette/entity/command';
import { ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export class InMemoryCommandRegistry implements CommandRegistry {
    private byId = new Map<string, Command>();
    private byAlias = new Map<string, string>();

    add(cmd: Command): void {
        this.byId.set(cmd.id, cmd);
        for (const a of cmd.aliases) this.byAlias.set(a.toLowerCase(), cmd.id);
    }

    remove(id: string): void {
        const cmd = this.byId.get(id);
        if (cmd) {
            for (const a of cmd.aliases) this.byAlias.delete(a.toLowerCase());
        }
        this.byId.delete(id);
    }

    getById(id: string): Command<unknown> | null {
        return this.byId.get(id) ?? null;
    }

    getByAlias(alias: string): Command<unknown> | null {
        const id = this.byAlias.get(alias.toLowerCase());
        return id ? this.getById(id) : null;
    }

    list(): ListedCommand[] {
        return Array.from(this.byId.values()).map(c => ({
            id: c.id,
            title: c.title,
            scope: c.scope,
            subtitle: c.subtitle,
            group: c.group,
            keywords: c.keywords ?? [],
            aliases: c.aliases,
            syntax: c.syntax,
        }));
    }

    aliases(): Map<string, string> {
        return new Map(this.byAlias);
    }
}
