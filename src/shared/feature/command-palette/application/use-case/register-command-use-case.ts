import { RegisterCommand } from '@/shared/feature/command-palette/application/port/in/register-command';
import { CommandRegistry } from '@/shared/feature/command-palette/application/port/out/command-registry';
import { Command } from '@/shared/feature/command-palette/entity/command';

export class RegisterCommandUseCase implements RegisterCommand {
    constructor(private readonly registry: CommandRegistry) {}
    register(cmd: Command) {
        this.registry.add(cmd);
    }
}
