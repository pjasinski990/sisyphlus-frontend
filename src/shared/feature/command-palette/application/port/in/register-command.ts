import { Command } from '@/shared/feature/command-palette/entity/command';

export interface RegisterCommand {
    register(cmd: Command): void;
}
