import { z } from 'zod';

export type HeadMatcher =
    | { kind: 'literal'; literal: string }
    | { kind: 'regex'; regex: RegExp };

export interface PositionalSpec {
    name: string;
    schema: z.ZodType;
    rest?: boolean;
    hint?: string;
    example?: string;
}

export interface PrefixSpec {
    head: HeadMatcher;
    name: string;
    schema: z.ZodType;
    multi?: boolean;
    rest?: boolean;
    hint?: string;
    example?: string;
}

export interface CommandSyntax {
    positionals?: ReadonlyArray<PositionalSpec>;
    prefixes?: ReadonlyArray<PrefixSpec>;
}
