export type ISODateString = string & { __brand: 'ISODateString' };

export function makeISODateString(s: string): ISODateString {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        throw new Error('Expected YYYY-MM-DD');
    }
    const [y, m, d] = s.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    const ok =
        dt.getUTCFullYear() === y &&
        dt.getUTCMonth() + 1 === m &&
        dt.getUTCDate() === d;
    if (!ok) throw new Error('Invalid calendar date');
    return s as ISODateString;
}
