import { z } from 'zod';
import { CommandSyntax } from './syntax';

export interface CommandContext {
    scope?: string;
    hidden?: Record<string, unknown>;
}

export interface Command<TParsed = unknown> {
    id: string;
    scope: string;
    title: string;
    subtitle?: string;
    group?: string;
    keywords?: string[];
    aliases: string[];
    syntax?: CommandSyntax;
    input?: {
        schema: z.ZodType<TParsed>;
        placeholder?: string;
    };
    run(opts: TParsed, ctx: CommandContext): void | Promise<void>;
}
