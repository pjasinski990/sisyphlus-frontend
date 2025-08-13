import { Task } from '../../../entity/task';

export interface TaskApi {
    create(task: Task): Promise<Task>;
}
