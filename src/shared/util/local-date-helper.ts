export const nowLocalTime = (): string => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
};

export const todayLocalDate = () => {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
};

export const tomorrowLocalDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-CA');
};
