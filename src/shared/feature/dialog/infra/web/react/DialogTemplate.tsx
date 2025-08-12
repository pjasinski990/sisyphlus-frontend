import React from 'react';

export type DialogTemplateComponent = React.ComponentType<{ id: string; payload: unknown }>;

const templates = new Map<string, DialogTemplateComponent>();

export function registerDialogTemplate(key: string, component: DialogTemplateComponent) {
    templates.set(key, component);
}

export function unregisterDialogTemplate(key: string) {
    templates.delete(key);
}

export function getDialogTemplate(key: string) {
    return templates.get(key);
}
