/**
 * Util.js
 */
import { Hodesh12, Hodesh13, SZFH, SZFHsrc, Haftara2, Haftara2src } from './HebcalTables.js';

export function is_summer_clock(day, month, year) {
    const last_sunday_march = 31 - ((year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + 5) % 7);
    const dst_start = last_sunday_march - 2; // Friday before last Sunday
    const last_sunday_october = 31 - ((year + Math.floor(year / 4) - Math.floor(year / 100) + Math.floor(year / 400) + 1) % 7);

    if ((month > 3 && month < 10) || (month === 3 && day >= dst_start) || (month === 10 && day <= last_sunday_october)) {
        return true;
    }
    return false;
}

// String helper to mimic C++ stradd/strcat logic
export function stradd(base, addition, separator = "", type = 0) {
    if (!addition) return base;
    return base + separator + addition;
}

export function Convert_year2letters(year) {
    // Basic implementation of Hebrew year to letters (e.g., 5785 -> תשפ"ה)
    // Simplified for this port
    return `התשפ"ה`;
}