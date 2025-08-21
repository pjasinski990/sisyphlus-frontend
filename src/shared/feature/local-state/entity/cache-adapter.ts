import type { QueryClient } from '@tanstack/react-query';
import { Changeset, ChangesetItem } from '@/shared/feature/local-state/entity/changeset';

export interface CacheAdapter {
    collections?: string[];
    events?: string[];
    apply: (qc: QueryClient, item: ChangesetItem) => void;
}

const collectionMap = new Map<string, CacheAdapter[]>();
const eventMap = new Map<string, CacheAdapter[]>();

export function registerCacheAdapter(adapter: CacheAdapter) {
    for (const c of adapter.collections ?? []) {
        if (!collectionMap.has(c)) collectionMap.set(c, []);
        collectionMap.get(c)!.push(adapter);
    }
    for (const e of adapter.events ?? []) {
        if (!eventMap.has(e)) eventMap.set(e, []);
        eventMap.get(e)!.push(adapter);
    }
}

export function applyChangeset(qc: QueryClient, cs: Changeset) {
    for (const item of cs) {
        dispatch(qc, item);
    }
}

function dispatch(qc: QueryClient, item: ChangesetItem) {
    if (item.kind === 'collection') {
        const handlers = collectionMap.get(item.collection) ?? [];
        for (const h of handlers) h.apply(qc, item);
    } else {
        const handlers = eventMap.get(item.type) ?? [];
        for (const h of handlers) h.apply(qc, item);
    }
}
