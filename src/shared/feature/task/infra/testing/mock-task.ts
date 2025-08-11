import { Task } from '../../entity/task';
import { v4 as uuid } from 'uuid';

export const mockTasks: Task[] = [
    {
        id: uuid(),
        title: 'some task',
        description: 'do a thing',
        status: 'todo',
        energy: 'medium',
        minute_estimated: 0,
        minutes_spent: 0,
        tags: [],
        parent_id: null,
        isKey: false
    },
    {
        id: uuid(),
        title: 'some other task',
        description: 'do a second thing',
        status: 'todo',
        energy: 'medium',
        minute_estimated: 0,
        minutes_spent: 0,
        tags: [],
        parent_id: null,
        isKey: false
    }
];
