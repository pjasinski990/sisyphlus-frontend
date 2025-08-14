import { SuggestCommands } from '@/shared/feature/command-palette/application/port/in/suggest-commands';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { SearchEngine } from '@/shared/feature/command-palette/application/port/out/search-engine';
import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';

export class SuggestCommandsUseCase implements SuggestCommands {
    constructor(
        private readonly registry: CommandRegistry,
        private readonly search: SearchEngine,
    ) {}
    suggest(query: string, limit?: number): CommandSuggestion[] {
        const items = this.registry.list();
        return this.search.search(query, items, limit);
    }
}
