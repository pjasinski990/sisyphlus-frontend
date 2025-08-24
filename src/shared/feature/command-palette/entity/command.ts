import type { ReactNode } from 'react';
import { z } from 'zod';
import type { RichParse, RichInputParser, Hint } from './input-parser';
import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';

export interface CommandContext {
    scope?: string;
    hidden?: Record<string, unknown>;
}

export interface PreviewProps<TParsed> {
    rawInput: string;
    parse: RichParse<TParsed>;
    hints: Hint[];
    ready: boolean;
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
        parser?: RichInputParser<TParsed>;
        schema?: z.ZodType<TParsed>;
        placeholder?: string;
    };

    renderPreview?: (p: PreviewProps<TParsed>) => ReactNode;
    run(opts: TParsed, ctx: CommandContext): void | Promise<void>;
}
