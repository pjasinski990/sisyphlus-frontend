import { SearchEngine } from '@/shared/feature/command-palette/application/port/out/search-engine';
import { CommandSuggestion, ListedCommand } from '@/shared/feature/command-palette/entity/listed-command';

function norm(s: string): string { return s.toLowerCase(); }
function scoreSubsequence(q: string, t: string): number {
    let qi = 0; let s = 0;
    const Q = norm(q), T = norm(t);
    for (let i = 0; i < T.length && qi < Q.length; i++) {
        if (T[i] === Q[qi]) { s += 1; if (i === 0 || /[\s\-_.]/.test(T[i - 1])) s += 2; qi++; }
    }
    return qi === Q.length ? s : -1;
}

export class BasicFuzzySearchEngine implements SearchEngine {
    search(query: string, items: ListedCommand[], limit: number = 20): CommandSuggestion[] {
        const q = query.trim();
        if (!q) {
            return items
                .slice()
                .sort((a, b) => (a.group ?? '').localeCompare(b.group ?? '') || a.title.localeCompare(b.title))
                .slice(0, limit)
                .map(i => ({ ...i, score: 0 }));
        }
        const out: CommandSuggestion[] = [];
        for (const it of items) {
            const hay = [it.title, it.subtitle ?? '', ...it.keywords, ...it.aliases].join(' ');
            const s = scoreSubsequence(q, hay);
            if (s >= 0) out.push({ ...it, score: s });
        }
        out.sort((a, b) => b.score - a.score || (a.group ?? '').localeCompare(b.group ?? '') || a.title.localeCompare(b.title));
        return out.slice(0, limit);
    }
}
