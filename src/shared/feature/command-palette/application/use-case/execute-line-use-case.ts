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

    async execute(rawLine: string, ctx: CommandContext = {}) {
        const head = parseAlias(rawLine, this.cfg);
        if (!head) return nok('No command provided');

        const cmd = this.registry.getByAlias(head.alias);
        if (!cmd) return nok('Invalid command provided');
        if (ctx.scope && cmd.scope !== ctx.scope) return nok('Command not available here');

        const values = parseWithSyntax(head.rest, cmd.syntax ?? {}, this.cfg);

        let parsed: unknown = values;
        if (cmd.input?.parser) {
            const base = typeof values['natural'] === 'string' ? values['natural'] : head.rest;
            const r = cmd.input.parser.parse(base);
            if (!r.ok) return nok(r.error);
            parsed = r.value;
        }

        if (cmd.input?.schema) {
            const res = (cmd.input.schema as z.ZodType).safeParse(parsed);
            if (!res.success) {
                const msg = res.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
                return nok(msg);
            }
            await cmd.run(res.data, ctx);
            return ok(null);
        }

        await cmd.run(parsed as any, ctx);
        return ok(null);
    }
}
