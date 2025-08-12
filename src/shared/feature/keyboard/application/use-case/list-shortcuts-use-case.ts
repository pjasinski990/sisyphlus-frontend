import { ListShortcuts } from '../port/in/list-shortcuts';
import { ShortcutRegistry } from '../port/out/shortcut-registry';
import { GroupedShortcuts } from '@/shared/feature/keyboard/entity/listed-shortcut';

export class ListShortcutsUseCase implements ListShortcuts {
    constructor(private readonly registry: ShortcutRegistry) {}
    listShortcutsByScope(): GroupedShortcuts {
        return this.registry.snapshotGroupedByScope();
    }
}
