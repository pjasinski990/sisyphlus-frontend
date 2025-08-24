import { CommandSyntax } from '@/shared/feature/command-palette/entity/syntax';

export interface ListedCommand {
    id: string;
    title: string;
    scope: string;
    subtitle?: string;
    group?: string;
    keywords: string[];
    aliases: string[];
    syntax?: CommandSyntax;
}

export interface CommandSuggestion extends ListedCommand {
    score: number;
}
