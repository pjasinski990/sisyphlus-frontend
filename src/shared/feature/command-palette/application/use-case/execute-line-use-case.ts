import { ExecuteLine } from '@/shared/feature/command-palette/application/port/in/execute-line';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { z } from 'zod';
import { parseAlias } from '@/shared/feature/command-palette/entity/parsed-alias';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';

export class ExecuteLineUseCase implements ExecuteLine {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly cfg: PaletteConfig
    ) {}

    async execute(rawLine: string, ctx: CommandContext = {}): AsyncResult<string, null> {
        const scope = ctx.scope;
        const head = parseAlias(rawLine, this.cfg);
        if (!head) return nok('No command provided');

        const cmd = this.registry.getByAlias(head.alias);
        if (scope && cmd?.scope !== scope) return nok('Command not available here');
        if (!cmd) return nok('Invalid command provided');

        if (cmd.syntax && cmd.input?.schema) {
            const values = parseWithSyntax(head.rest, cmd.syntax, this.cfg);
            const merged = { ...values, ...(ctx.hidden ?? {}) };
            const res = (cmd.input.schema as z.ZodType).safeParse(merged);
            if (!res.success) {
                const msg = res.error.issues
                    .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
                    .join('; ');
                return nok(msg);
            }
            await cmd.run(res.data, ctx);
            return ok(null);
        }

        if (cmd.input?.schema) {
            const res = (cmd.input.schema as z.ZodType).safeParse(ctx.hidden ?? {});
            if (!res.success) {
                const msg = res.error.issues
                    .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
                    .join('; ');
                return nok(msg);
            }
            await cmd.run(res.data, ctx);
            return ok(null);
        }

        await cmd.run(undefined as unknown, ctx);
        return ok(null);
    }
}
