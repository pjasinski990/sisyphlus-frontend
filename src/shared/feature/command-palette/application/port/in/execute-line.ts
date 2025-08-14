export interface ExecuteLine {
    execute(rawLine: string): Promise<void>;
}
