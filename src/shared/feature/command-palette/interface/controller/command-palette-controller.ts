import { InMemoryCommandRegistry } from '@/shared/feature/command-palette/infra/providers/in-memory-command-registry';
import { BasicFuzzySearchEngine } from '@/shared/feature/command-palette/infra/providers/basic-fuzzy-search-engine';
import {
    RegisterCommandUseCase
} from '@/shared/feature/command-palette/application/use-case/register-command-use-case';
import {
    UnregisterCommandUseCase
} from '@/shared/feature/command-palette/application/use-case/unregister-command-use-case';
import { ListCommandsUseCase } from '@/shared/feature/command-palette/application/use-case/list-commands-use-case';
import {
    SuggestCommandsUseCase
} from '@/shared/feature/command-palette/application/use-case/suggest-commands-use-case';
import { ExecuteLineUseCase } from '@/shared/feature/command-palette/application/use-case/execute-line-use-case';
import { RegisterCommand } from '@/shared/feature/command-palette/application/port/in/register-command';
import { UnregisterCommand } from '@/shared/feature/command-palette/application/port/in/unregister-command';
import { ListCommands } from '@/shared/feature/command-palette/application/port/in/list-commands';
import { SuggestCommands } from '@/shared/feature/command-palette/application/port/in/suggest-commands';
import { ExecuteLine } from '@/shared/feature/command-palette/application/port/in/execute-line';
import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';
import { defaultPaletteConfig, PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { Command, CommandContext } from '@/shared/feature/command-palette/entity/command';

export class CommandPaletteController {
    constructor(
        readonly config: PaletteConfig,
        private readonly register: RegisterCommand,
        private readonly unregister: UnregisterCommand,
        private readonly list: ListCommands,
        private readonly suggest: SuggestCommands,
        private readonly executeLine: ExecuteLine,
    ) {}

    handleRegisterCommand(cmd: Command): void {
        this.register.register(cmd);
    }

    handleUnregisterCommand(id: string) { this.unregister.unregister(id); }

    // TODO how come this is unused?
    handleList(context?: CommandContext) { return this.list.execute(context); }

    handleSuggest(q: string, context?: CommandContext, limit?: number): CommandSuggestion[] { return this.suggest.execute(q, context, limit); }

    async handleExecuteLine(line: string, ctx: CommandContext = {}): AsyncResult<string, null> {
        return this.executeLine.execute(line, ctx);
    }
}

const config = defaultPaletteConfig;
const registry = new InMemoryCommandRegistry();
const search = new BasicFuzzySearchEngine();
const register = new RegisterCommandUseCase(registry);
const unregister = new UnregisterCommandUseCase(registry);
const list = new ListCommandsUseCase(registry);
const suggest = new SuggestCommandsUseCase(search, list);
const executeLine = new ExecuteLineUseCase(registry, config);

export const commandPaletteController = new CommandPaletteController(
    config,
    register,
    unregister,
    list,
    suggest,
    executeLine,
);
