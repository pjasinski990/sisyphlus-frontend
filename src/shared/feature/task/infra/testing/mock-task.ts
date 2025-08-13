import { Task } from '../../entity/task';
import { v4 as uuid } from 'uuid';
import { HttpTaskApi } from '@/shared/feature/task/infra/http-task-api';

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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];

const api = new HttpTaskApi();
await api.create(mockTasks[0]);
