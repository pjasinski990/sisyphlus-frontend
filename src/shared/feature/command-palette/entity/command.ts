import type { ReactNode } from 'react';
import { z } from 'zod';
import type { InputParser, Parsed } from './input-parser';
import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';

export interface CommandContext<TArgs = unknown> {
    scope?: string;
    callerArgs?: Record<string, TArgs>;
}

export interface PreviewProps<TParsed> {
    rawInput: string;
    parse: Parsed<TParsed>;
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
        parser?: InputParser<TParsed>;
        schema?: z.ZodType<TParsed>;
        placeholder?: string;
    };

    renderPreview?: (p: PreviewProps<TParsed>) => ReactNode;
    run<TArgs>(opts: TParsed, ctx: CommandContext<TArgs>): void | Promise<void>;
}
