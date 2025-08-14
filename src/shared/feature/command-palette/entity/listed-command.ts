export interface ListedCommand {
    id: string;
    title: string;
    subtitle?: string;
    group?: string;
    keywords: string[];
    aliases: string[];
}

export interface CommandSuggestion extends ListedCommand {
    score: number;
}
