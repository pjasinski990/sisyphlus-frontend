import { z } from 'zod';
import { CommandSyntax } from './syntax';

export type CommandId = string;

export interface Command<TParsed = unknown> {
    id: CommandId;
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
    run: (opts: TParsed) => void | Promise<void>;
}
