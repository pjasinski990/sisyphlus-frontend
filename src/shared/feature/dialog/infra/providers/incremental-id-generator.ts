import { IdGenerator } from '../../application/port/out/id-generator';

export class IncrementalIdGenerator implements IdGenerator {
    private i = 0;
    next(): string {
        this.i = (this.i + 1) >>> 0;
        return `dlg_${Date.now().toString(36)}_${this.i.toString(36)}`;
    }
}
