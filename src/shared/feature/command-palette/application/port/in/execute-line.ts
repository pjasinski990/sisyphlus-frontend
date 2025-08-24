import { AsyncResult } from '@/shared/feature/auth/entity/result';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';

export interface ExecuteLine {
    execute(rawLine: string, ctx: CommandContext): AsyncResult<string, null>;
}
