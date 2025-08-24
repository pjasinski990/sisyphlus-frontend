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
import { parseAlias } from '@/shared/feature/command-palette/entity/parsed-alias';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import React, { ReactNode } from 'react';

export class CommandPaletteController {
    constructor(
        readonly config: PaletteConfig,
        private readonly registry: CommandRegistry,
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

    handlePreview(line: string): { preview?: ReactNode } {
        const head = parseAlias(line, this.config);
        if (!head) return {};
        const cmd = this.registry.getByAlias(head.alias);
        if (!cmd?.renderPreview) return {};

        const values = parseWithSyntax(head.rest, cmd.syntax ?? {}, this.config);
        const base = typeof values['natural'] === 'string' ? values['natural'] : head.rest;

        const parse = cmd.input?.parser?.parse(base) ?? { ok: true, value: values, hints: [] };
        const hints = (parse as any).hints ?? [];

        const ready =
            parse.ok && (cmd.input?.schema ? (cmd.input.schema.safeParse(parse.value).success) : true);

        return {
            preview: cmd.renderPreview({ rawInput: base, parse, hints, ready }) as any
        };
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
    registry,
    register,
    unregister,
    list,
    suggest,
    executeLine,
);
