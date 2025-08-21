import { createTaskCacheAdapter } from '@/shared/feature/task/interface/web/react/task-cache-adapter';
import { createDayPlanCacheAdapter } from '@/feature/day-plan/interface/web/react/day-plan-cache-adapter';
import { registerCacheAdapter } from '@/shared/feature/local-state/entity/cache-adapter';

export function bootstrapCache() {
    registerCacheAdapter(createTaskCacheAdapter());
    registerCacheAdapter(createDayPlanCacheAdapter());
}
