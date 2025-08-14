import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';

export interface SuggestCommands {
    suggest(query: string, limit?: number): CommandSuggestion[];
}
