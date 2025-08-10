import { Theme } from '@/feature/theme/entity/theme';
import { SetDocumentTheme } from '@/feature/theme/application/port/in/set-document-theme';
import { WatchSystemTheme } from '@/feature/theme/application/port/in/watch-system-theme';
import { SetDocumentThemeUseCase } from '@/feature/theme/application/use-case/set-document-theme-use-case';
import { WatchSystemThemeUseCase } from '@/feature/theme/application/use-case/watch-system-theme-use-case';

export class ThemeController {
    constructor(
        private readonly setDocumentTheme: SetDocumentTheme,
        private readonly watchSystemThemeUpdate: WatchSystemTheme,
    ) { }

    handleNewTheme(theme: Theme): void {
        return this.setDocumentTheme.execute(theme);
    };

    handleSystemThemeUpdated(onChange: (theme: Exclude<Theme, 'system'>) => void): () => void {
        return this.watchSystemThemeUpdate.execute(onChange);
    };
}

export const themeController = new ThemeController(
    new SetDocumentThemeUseCase(),
    new WatchSystemThemeUseCase(),
);
