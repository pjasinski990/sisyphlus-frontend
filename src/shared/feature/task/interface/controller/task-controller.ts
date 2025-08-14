import { PushToInbox } from '@/shared/feature/task/application/port/in/push-to-inbox';
import { Task } from '@/shared/feature/task/entity/task';

export class TaskController {
    constructor(
        private readonly pushToInbox: PushToInbox,
    ) { }

    async handlePushToInbox(task: Task): Promise<void> {
        await this.pushToInbox.execute(task);
    }
}
