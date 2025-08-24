import { SuggestCommands } from '@/shared/feature/command-palette/application/port/in/suggest-commands';
import { SearchEngine } from '@/shared/feature/command-palette/application/port/out/search-engine';
import { CommandSuggestion } from '@/shared/feature/command-palette/entity/listed-command';
import { CommandContext } from '@/shared/feature/command-palette/entity/command';
import { ListCommands } from '@/shared/feature/command-palette/application/port/in/list-commands';

export class SuggestCommandsUseCase implements SuggestCommands {
    constructor(
        private readonly search: SearchEngine,
        private readonly listCommands: ListCommands,
    ) {}
    execute(query: string, context?: CommandContext, limit?: number): CommandSuggestion[] {
        let items = this.listCommands.execute(context);
        return this.search.search(query, items, limit);
    }
}
