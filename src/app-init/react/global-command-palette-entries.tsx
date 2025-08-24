import React, { useEffect } from 'react';
import { z } from 'zod';
import { v4 as uuid } from 'uuid';
import { commandPaletteController } from '@/shared/feature/command-palette/interface/controller/command-palette-controller';
import { EnergyLevel, Task } from '@/shared/feature/task/entity/task';
import { useAuth } from '@/shared/feature/auth/interface/web/react/auth/hook/useAuth';
import { usePushToInboxMutation } from '@/feature/inbox/interface/web/react/use-push-to-inbox';
import { parseDurationToMinutes } from '@/shared/feature/command-palette/infra/parsing/smart-duration';
import { InboxTaskCard } from '@/feature/inbox/interface/web/react/InboxTaskCard';

const AddToInboxCommandSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    context: z.string().optional(),
    energy: z.enum(['low', 'medium', 'high']).optional(),
    tags: z.array(z.string()).optional(),
    duration: z
        .union([
            z.coerce.number().int().positive(),
            z.string().min(1).refine((s) => parseDurationToMinutes(s) !== null, 'Invalid duration'),
        ])
        .optional(),
});

export const GlobalCommandPaletteEntries: React.FC = () => {
    const id = uuid();
    const authState = useAuth();
    const userId = authState.status === 'authenticated' ? authState.user.id : null;
    const { mutate } = usePushToInboxMutation();

    useEffect(() => {
        commandPaletteController.handleRegisterCommand({
            id,
            scope: 'global',
            title: 'Create Inbox Task',
            subtitle: 'Push a task to the Inbox',
            group: 'Tasks',
            keywords: ['add', 'task', 'todo', 'inbox'],
            aliases: ['add', 'in', 'todo'],
            syntax: {
                positionals: [{ name: 'title', schema: z.string(), rest: true }],
                prefixes: [
                    { head: { kind: 'literal', literal: '@' }, name: 'context', hint: 'Where does it occur / what does it relate to?' , schema: z.string() },
                    { head: { kind: 'literal', literal: '!' }, name: 'energy', hint: 'How mentally draining is it?', schema: z.string() },
                    { head: { kind: 'literal', literal: '#' }, name: 'tags', hint: 'For grouping / filtering', schema: z.string(), multi: true },
                    { head: { kind: 'literal', literal: '%' }, name: 'duration', hint: 'Estimated duration', schema: z.string() },
                    { head: { kind: 'regex', regex: /\n/ }, name: 'description', hint: 'Details (markdown supported)', schema: z.string(), rest: true },
                ],
            },

            renderPreview: ({ parse, ready }) => {
                const v = parse.ok ? (parse.value as Record<string, unknown>) : {};
                const title = (v.title as string) || '[title]';
                const description = (v.description as string) || '';
                const context = (v.context as string) || '';
                const energy = ['low', 'medium', 'high'].includes(v.energy as string) ? v.energy as EnergyLevel : 'medium';
                const tags = (v.tags as string[]) || [];
                const rawDur = v.duration as string | number | undefined;

                let minutes: number | undefined;
                let durError: string | null = null;

                if (typeof rawDur === 'number') minutes = rawDur;
                else if (typeof rawDur === 'string') {
                    const parsed = parseDurationToMinutes(rawDur);
                    if (parsed === null) durError = `Unrecognized duration: “${rawDur}”`;
                    else minutes = parsed;
                }

                const task: Task = {
                    id: 'temp',
                    userId: 'temp',
                    category: 'simple',
                    status: 'todo',
                    title,
                    description,
                    energy,
                    context,
                    tags,
                    estimatedMin: minutes,
                };

                return (
                    <InboxTaskCard task={task} />
                );
            },

            input: {
                schema: AddToInboxCommandSchema,
                placeholder: '/in do laundry @home !low #chore %1h30m',
            },

            run: async (opts) => {
                const v = AddToInboxCommandSchema.parse(opts);

                let estimatedMin: number | undefined;
                if (typeof v.duration === 'number') {
                    estimatedMin = v.duration;
                } else if (typeof v.duration === 'string') {
                    estimatedMin = parseDurationToMinutes(v.duration)!;
                }

                const task: Task = {
                    id: uuid(),
                    // @ts-expect-error user gets resolved post-auth
                    userId,
                    title: v.title,
                    description: v.description,
                    context: v.context,
                    energy: v.energy ?? 'medium',
                    tags: v.tags ?? [],
                    estimatedMin,
                    category: 'simple',
                    status: 'todo',
                };
                mutate(task);
            },
        });

        return () => commandPaletteController.handleUnregisterCommand(id);
    }, [id, mutate, userId]);

    return null;
};
