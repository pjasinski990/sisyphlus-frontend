import { Task } from '../../entity/task';
import { v4 as uuid } from 'uuid';

export const mockTasks: Task[] = [
    {
        id: uuid(),
        userId: 'mock_user',
        title: 'some task',
        description: 'do a thing',
        status: 'todo',
        energy: 'medium',
        tags: [],
        category: 'simple',
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    },
    {
        id: uuid(),
        userId: 'mock_user',
        title: 'some other task',
        description: 'do a second thing',
        status: 'todo',
        energy: 'medium',
        tags: [],
        category: 'simple',
        createdAt: Date.now().toString(),
        updatedAt: Date.now().toString(),
    }
];
