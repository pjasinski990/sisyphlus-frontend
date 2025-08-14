import { ExecuteLine } from '@/shared/feature/command-palette/application/port/in/execute-line';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';
import { z } from 'zod';
import { parseAlias } from '@/shared/feature/command-palette/entity/parsed-alias';

export class ExecuteLineUseCase implements ExecuteLine {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly cfg: PaletteConfig
    ) {}

    async execute(rawLine: string): Promise<void> {
        const head = parseAlias(rawLine, this.cfg);
        if (!head) return;

        const cmd = this.registry.getByAlias(head.alias);
        if (!cmd) return;

        if (cmd.syntax && cmd.input?.schema) {
            const parsed = parseWithSyntax(head.rest, cmd.syntax, cmd.input.schema as z.ZodType<unknown>, this.cfg);
            await cmd.run(parsed);
            return;
        }

        if (cmd.input?.schema) {
            await cmd.run((cmd.input.schema as z.ZodType<unknown>).parse({}));
            return;
        }

        await cmd.run(undefined);
    }
}
