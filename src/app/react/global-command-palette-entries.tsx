import React, { useEffect } from 'react';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import {
    commandPaletteController
} from '@/shared/feature/command-palette/interface/controller/command-palette-controller';
import { Task } from '@/shared/feature/task/entity/task';
import { useAuth } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuth';
import { usePushToInboxMutation } from '@/shared/feature/task/interface/web/react/task-query-hook';

const Schema = z.object({
    title: z.string().min(1),
    context: z.string().optional(),
    energy: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
});

export const CommandPaletteEntries: React.FC = () => {
    const id = uuid();
    const authState = useAuth();
    const userId = authState.status === 'authenticated' ? authState.user.id : null;

    const { mutate } = usePushToInboxMutation();

    useEffect(() => {
        commandPaletteController.handleRegisterCommand({
            id,
            title: 'Create Inbox Task',
            subtitle: 'Add a task to your Inbox',
            group: 'Tasks',
            keywords: ['add', 'task', 'todo', 'inbox'],
            aliases: ['in', 'task'],
            syntax: {
                positionals: [{ name: 'title', schema: z.string(), rest: true }],
                prefixes: [
                    { head: { kind: 'literal', literal: '@' }, name: 'context', schema: z.string() },
                    { head: { kind: 'literal', literal: '!' }, name: 'energy', schema: z.string() },
                    { head: { kind: 'literal', literal: '#' }, name: 'tag', schema: z.string(), multi: true },
                ],
            },
            input: { schema: Schema, placeholder: '/in do laundry @home !low #chore' },
            run: async (opts) => {
                const v = Schema.parse(opts);
                // TODO this should be a use case - business logic
                const task: Task = {
                    id: uuid(),
                    // TODO fix loading of user-specific content before auth completes
                    userId,
                    title: v.title,
                    context: v.context,
                    energy: v.energy ?? 'medium',
                    tags: v.tags ?? [],

                    category: 'simple',
                    status: 'todo',

                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                };
                mutate(task);
            },
        });
        return () => commandPaletteController.handleUnregisterCommand(id);
    }, [id, mutate, userId]);
    return null;
};
