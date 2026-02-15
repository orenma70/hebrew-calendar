/**
 * Translates is_Meuberet logic from C++
 * Note: In JS we use zero-based indexing for arrays, 
 * but since your week_ptr_parasha logic is custom, 
 * we keep the numeric comparisons identical.
 */
export function isJoinedParsha(isLeapYear, weekPtrParasha, siman) {
    if (isLeapYear) {
        // Haber logic for leap years
        // C++: ((Siman == 582) || (Siman == 387) || (Siman == 537)) && (week_ptr_parasha == 38)
        if ([582, 387, 537].includes(siman) && weekPtrParasha === 38) {
            return true;
        }
        return false;
    } else {
        // Haber logic for regular years
        if (siman !== 135 && weekPtrParasha === 21) return true; // Vayakhel-Pekudei
        if (siman !== 725 && weekPtrParasha === 31) return true; // Behar-Bechukotai

        // Fixed join points
        if ([26, 28, 38].includes(weekPtrParasha)) return true;

        return false;
    }
}