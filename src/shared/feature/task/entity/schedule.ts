export interface Schedule {
    rrule: string;              // icalendar - rfc 5545
    timezone: string;           // eg. 'Europe/Warsaw'
    additionalDates: string[];  // YYYY-MM-DD
    excludedDates: string[];    // YYYY-MM-DD
    beginDate: string;          // YYYY-MM-DD
    untilDate?: string;         // YYYY-MM-DD
}
