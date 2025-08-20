export const todayLocalDate = () => {
    return new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
};

export const tomorrowLocalDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-CA');
};
