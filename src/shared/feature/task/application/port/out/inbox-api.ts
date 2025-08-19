import { Task } from '../../../entity/task';

export interface InboxApi {
    create(task: Task): Promise<Task>;
    getInbox(): Promise<Task[]>;
    getByIds(ids: string[]): Promise<Task[]>;
}
