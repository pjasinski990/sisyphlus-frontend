import { ExecuteLine } from '@/shared/feature/command-palette/application/port/in/execute-line';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { PaletteConfig } from '@/shared/feature/command-palette/entity/palette-config';
import { parseWithSyntax } from '@/shared/feature/command-palette/infra/parsing/parse-with-syntax';
import { z } from 'zod';
import { parseAlias } from '@/shared/feature/command-palette/entity/parsed-alias';
import { AsyncResult, nok, ok } from '@/shared/feature/auth/entity/result';

export class ExecuteLineUseCase implements ExecuteLine {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly cfg: PaletteConfig
    ) {}

    async execute(rawLine: string): AsyncResult<string, null> {
        const head = parseAlias(rawLine, this.cfg);
        if (!head) return nok('No command provided');

        const cmd = this.registry.getByAlias(head.alias);
        if (!cmd) return nok('Invalid command provided');

        if (cmd.syntax && cmd.input?.schema) {
            const res = parseWithSyntax(head.rest, cmd.syntax, cmd.input.schema as z.ZodType, this.cfg);
            if (!res.ok) {
                return nok(res.error);
            }
            await cmd.run(res.value.data);
            return ok(null);
        }

        if (cmd.input?.schema) {
            const res = (cmd.input.schema as z.ZodType).safeParse({});
            if (!res.success) {
                const msg = res.error.issues
                    .map(i => `${i.path.join('.') || '(root)'}: ${i.message}`)
                    .join('; ');
                return nok(msg);
            }

            await cmd.run(res.data);
            return ok(null);
        }

        await cmd.run(undefined);
        return ok(null);
    }
}
