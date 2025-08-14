import React, { useEffect } from 'react';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';

const Schema = z.object({
    title: z.string().min(1),
    context: z.string().optional(),
    energy: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
});

export const CommandPaletteEntries: React.FC = () => {
    const id = uuid();
    useEffect(() => {
        commandPaletteController.handleRegisterCommand({
            id,
            title: 'Create Inbox Task',
            subtitle: 'Add a task to your Inbox',
            group: 'Tasks',
            keywords: ['add', 'task', 'todo', 'inbox'],
            aliases: ['in'],
            syntax: {
                positionals: [{ name: 'title', schema: z.string(), rest: true }],
                prefixes: [
                    { head: { kind: 'literal', literal: '@' }, name: 'context', schema: z.string() },
                    { head: { kind: 'literal', literal: '!' }, name: 'energy', schema: z.string() },
                    { head: { kind: 'literal', literal: '#' }, name: 'tags', schema: z.string(), multi: true },
                ],
            },
            input: { schema: Schema, placeholder: '/in do laundry @home !low #chore' },
            run: async (opts) => {
                const v = Schema.parse(opts);
                console.log('Create task:', v);
            },
        });
        return () => commandPaletteController.handleUnregisterCommand(id);
    }, [id]);
    return null;
};
