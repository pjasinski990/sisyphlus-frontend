import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';

export interface SuggestCommands {
    execute(query: string, limit?: number): CommandSuggestion[];
}
