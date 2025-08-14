import { CommandSuggestion, ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

export interface SearchEngine {
    search(query: string, items: ListedCommand[], limit?: number): CommandSuggestion[];
}
