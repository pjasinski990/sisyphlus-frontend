import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';

export interface SuggestCommands {
    execute(query: string, context?: CommandContext, limit?: number): CommandSuggestion[];
}
