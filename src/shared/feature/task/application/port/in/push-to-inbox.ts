import { Task } from '@/shared/feature/task/entity/task';

export interface PushToInbox {
    execute(task: Task): Promise<Task>;
}
