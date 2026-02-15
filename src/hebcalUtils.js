import { HebcalData } from './HebcalData';

export function calculateYourWeekIndex(date, y_ptr, siman, isLeap) {
    // 1. Setup Dates
    const rhMonth = HebcalData.Month[y_ptr];
    const rhDay = HebcalData.Day[y_ptr];
    const rhYear = 2024 + y_ptr;
    const roshHashanah = new Date(rhYear, rhMonth - 1, rhDay);

    // 2. Find the first Saturday of the year
    const rhDayOfWeek = siman % 10; // 1=Sun, 2=Mon... 7=Sat
    const daysToFirstShabbat = (7 - rhDayOfWeek + 1) % 7;
    const firstShabbat = new Date(roshHashanah);
    firstShabbat.setDate(roshHashanah.getDate() + daysToFirstShabbat);

    if (date < firstShabbat) return -1;

    // 3. Count Saturdays and handle "Holidays with no Parsha"
    // This is the core of your calc_year.cpp logic
    let weekCounter = 0;
    let currentShabbat = new Date(firstShabbat);

    while (currentShabbat <= date) {
        // Get day/month of this specific Shabbat to check for holidays
        // Note: You'll need a small helper to get Hebrew Date for this JS date
        // or use the current loop's month/day info.

        const isHolidayNoParsha = checkHolidayNoParsha(currentShabbat, y_ptr);

        if (!isHolidayNoParsha) {
            weekCounter++;
        }

        // Move to next Saturday
        currentShabbat.setDate(currentShabbat.getDate() + 7);
    }

    // weekCounter - 1 because array is 0-indexed
    return weekCounter - 1;
}

// Helper to identify weeks where we skip the Parsha (Sukkot, Pesach, etc.)
function checkHolidayNoParsha(jsDate, y_ptr) {
    // In your C++ code, you skip reading when a holiday falls on Shabbat
    // This usually includes:
    // - Shabbat Chol HaMoed Sukkot
    // - Shemini Atzeret
    // - Shabbat Chol HaMoed Pesach
    // - 7th/8th day of Pesach

    // For now, return false to keep the index moving.
    // If your index gets "ahead" of the calendar, it's because of these skips!
    return false;
}

// Maps a date to your specific Parsha array index
export function getHebrewParshaName(dateInput, y_ptr, isLeap, siman) {
    // SAFETY: If it's an HDate, convert to JS Date. If it's already a JS Date, keep it.
    const date = dateInput.greg ? dateInput.greg() : new Date(dateInput);

    const parashaArray = HebcalData.Parasha || HebcalData.parasha;
    if (!parashaArray) return "";

    const rhMonth = HebcalData.Month[y_ptr];
    const rhDay = HebcalData.Day[y_ptr];
    const rhYear = 2024 + y_ptr;

    const roshHashanah = new Date(rhYear, rhMonth - 1, rhDay);

    // Now .getTime() will work because 'date' is guaranteed to be a JS Date
    const diffTime = date.getTime() - roshHashanah.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const startDayOfWeek = (siman % 10);
    const daysToFirstShabbat = (7 - startDayOfWeek + 1) % 7;

    if (diffDays < daysToFirstShabbat) return "";

    let weekIndex = Math.floor((diffDays - daysToFirstShabbat) / 7);
    weekIndex -= 1;
    if (weekIndex >= 0 && weekIndex < parashaArray.length) {
        return parashaArray[weekIndex];
    }
    return "";
}

export function getSpecialShabbatName(d, month, isLeap, siman) {
    const rhDay = siman % 10;
    let szfhRow = -1;
    if (rhDay === 2 || rhDay === 3) szfhRow = 0;
    else if (rhDay === 5) szfhRow = 1;
    else if (rhDay === 7) szfhRow = 2;

    // Check against your SZFHarray logic
    // For March 1st (Adar), we check the Adar rows
    if (month === 5 && d >= 24) {
        // If the table says this year has Shekalim in this position
        if (HebcalData.SZFHarray[szfhRow][0]) return HebcalData.szfh[0];
    }

    // If it is Rosh Chodesh Adar itself (1st of Adar)
    if (month === 6 && d <= 1) {
        if (HebcalData.SZFHarray[szfhRow][0]) return HebcalData.szfh[0];
    }
    return "";
}

export function getSpecialShabbat(month, day, isLeap, siman) {
    // 1. Determine which row of the SZFH table to use based on the day of the week of RH
    // In your C++ logic, this depends on the ones digit of the Siman
    const rhDay = siman % 10;
    let szfhRow = -1;

    if (rhDay === 2 || rhDay === 3) szfhRow = 0; // Mon/Tue
    if (rhDay === 5) szfhRow = 1;                // Thu
    if (rhDay === 7) szfhRow = 2;                // Sat

    // 2. We only care about months Adar (6), Adar II (7), and Nissan (8)
    // Adjust month index if it's a leap year
    const targetMonth = isLeap ? month : (month >= 7 ? month + 1 : month);

    // Logic for finding the 'Saturday' index within the specific month
    // For simplicity in this React loop, we can check if it's a Saturday 
    // and then match it against the known rules for that Siman.

    return { szfhRow };
}

export function calculateHebrewDetails(dateObj) {
    const date = new Date(dateObj);
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();

    const now0Year = 2024;
    let y_ptr = y - now0Year;

    // Check if we are before Rosh Hashanah of the current Gregorian year
    if (y_ptr >= 0 && y_ptr < HebcalData.Day.length) {
        const rhMonth = HebcalData.Month[y_ptr];
        const rhDay = HebcalData.Day[y_ptr];
        if (m < rhMonth || (m === rhMonth && d < rhDay)) {
            y_ptr--;
        }
    }

    if (y_ptr < 0 || y_ptr >= HebcalData.YearSign.length) {
        throw new Error(`Index ${y_ptr} out of bounds`);
    }

    const isLeap = HebcalData.Meuberet_arr[y_ptr] === 1;
    const siman = HebcalData.YearSign[y_ptr];
    const SHK = Math.floor(siman / 10) % 10;

    // Month lengths logic ported from calc_year.cpp
    let monthLengths = isLeap
        ? [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29]
        : [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

    if (SHK === 3) monthLengths[1] = 30; // Shelemah (Full)
    if (SHK === 8) monthLengths[2] = 29; // Chaserah (Short)

    return {
        y_ptr,
        isLeap,
        siman,
        monthLengths,
        months: isLeap ? HebcalData.Hodesh13 : HebcalData.Hodesh12
    };
}