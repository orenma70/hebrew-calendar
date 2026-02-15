/**
 * CalcYear.js
 */
import {
    YearSign, Meuberet_arr, Month, Day, Month_buffer, Month_len,
    Yom, Hodesh12, Hodesh13, SZFHarray, SZFH, SZFHsrc,
    Parasha, Haftara, HaftaraPeshacsrc, Haftara7, Haftara2, Haftara2src, hebrew_numbers, hebrew_letters
} from './HebcalTables.js';
import { is_summer_clock, stradd } from './Util.js';
import { SunriseJerusalem } from './ZmanimTables.js'; // Assuming exported arrays
import { SunsetJerusalem } from './ZmanimTables.js';

function pesach_haft(dd, week_ptr_parasha, PP) {
    let P1, P2;

    // In JS, if we want to "return" a string to a caller's variable, 
    // it's best to return the result.
    let result = "";

    if (dd === 15) { // Pesach 1
        P1 = Parasha[week_ptr_parasha];
        P2 = Haftara7[0];
        result = P1 + HaftaraPeshacsrc[0] + P2;

    } else if (dd === 21) { // Pesach 7
        P1 = Parasha[week_ptr_parasha];
        P2 = Haftara7[2];
        result = P1 + HaftaraPeshacsrc[2] + P2;

    } else if (dd < 21 && dd > 15) { // Hol Hamoed
        P1 = Parasha[week_ptr_parasha];
        P2 = Haftara7[1];
        result = P1 + HaftaraPeshacsrc[1] + P2;
    }

    return result;
}



/**
 * Converts a numeric year (e.g. 5785) to Hebrew letter representation
 */
function Convert_year2letters(year) {
    let Hyear = "";

    // 1000s
    let inx = Math.floor(year / 1000) - 1;
    Hyear += hebrew_letters[inx] + "'";
    year = year - (inx + 1) * 1000;

    // 100s
    while (year >= 100) {
        if (year >= 400) { Hyear += hebrew_letters[21]; year -= 400; }
        else if (year >= 300) { Hyear += hebrew_letters[20]; year -= 300; }
        else if (year >= 200) { Hyear += hebrew_letters[19]; year -= 200; }
        else if (year >= 100) { Hyear += hebrew_letters[18]; year -= 100; }
    }

    if (year > 0) {
        if (year >= 10) {
            let tensInx = Math.floor(year / 10) - 1;
            Hyear += hebrew_letters[9 + tensInx];
            year = year - (tensInx + 1) * 10;
        }
        if (year > 0) {
            Hyear += hebrew_letters[year - 1];
        }
    }

    return insert_quote_before_last_char(Hyear);
}

function insert_quote_before_last_char(str) {
    if (str.length <= 1) return str;
    // For Hebrew (UTF-8), we take the last character and put " before it
    let body = str.slice(0, -1);
    let last = str.slice(-1);
    return body + '"' + last;
}

function day_info_str_js(dd, mm, day_ptr, Meuberet, Ner_chanuka, Omer, Avot) {
    let Line6 = "";

    // Rosh Chodesh / Month end logic
    if (((dd === 1) && mm) || ((dd === 30) && (mm !== 2))) {
        Line6 += (day_ptr === 7) ? Haftara3[4] : Haftara3[3];
    }

    // Tishrei
    if (mm === 0) {
        if (dd === 1) Line6 += Haftara1[0];
        else if (dd === 2) Line6 += Haftara1[1];
        else if (dd === 3 && day_ptr !== 7) Line6 += Haftara1[2];
        else if (dd === 4 && day_ptr === 1) Line6 += Haftara1[2] + " " + Haftara9[2];
        else if (dd < 10 && dd > 2 && day_ptr === 7) Line6 += Haftara5[1];
        else if (dd === 10) Line6 += Haftara11[0];
        else if (dd === 15) Line6 += "סכות א";
        else if (dd > 15 && dd < 22) {
            Line6 += (day_ptr === 7) ? "שבת " + Haftara1[6] : Haftara1[6];
        } else if (dd === 22) Line6 += Haftara1[7];

        if (dd > 22 || (dd > 10 && dd < 15) || dd === 9) Line6 += " " + Haftara9[1];
    }

    // Cheshvan
    if (mm === 1 && dd === 7) Line6 += Haftara2[3] + " " + Haftara2[2];

    // Kislev / Tevet (Chanuka)
    if ((mm === 2 || mm === 3) && Ner_chanuka > 0) {
        Line6 += Haftara3[0] + " " + hebrew_numbers[Ner_chanuka - 1];
        if (mm === 2 && dd === 30) {
            Line6 += (day_ptr === 7) ? " " + Haftara3[4] : " " + Haftara3[3];
        }
        if (mm === 3 && dd === 1) {
            Line6 += (day_ptr === 7) ? " " + Haftara3[4] : " " + Haftara3[3];
        }
        Line6 += " " + Haftara9[1];
    }
    if (mm === 3 && dd === 10) Line6 += Haftara4[0];

    // Shevat
    if (mm === 4 && dd === 15) Line6 += Haftara11[1] + " " + Haftara9[1];

    // Adar
    if (Meuberet && mm === 5) {
        if (dd === 14 || dd === 15) Line6 += "פורים קטן " + Haftara9[1];
    }
    if (mm === (5 + Meuberet)) {
        if (dd === 13 && day_ptr !== 7) Line6 += Haftara4[2];
        if (dd === 11 && day_ptr === 5) Line6 += Haftara4[2] + " " + Haftara9[3];
        if (dd === 14) Line6 += Haftara6[0];
        if (dd === 15) Line6 += "שושן פורים";
        if (dd === 14 || dd === 15) Line6 += " " + Haftara9[1];
    }

    // Nisan (Pesach)
    if (mm === (6 + Meuberet)) {
        if (dd === 13 && day_ptr === 6) Line6 += " ביעור חמץ";
        if (dd === 14 && day_ptr !== 7) Line6 += "ערב פסח - ביעור חמץ";
        if (dd === 15) Line6 += "פסח יום טוב א ";
        if (dd === 21) Line6 += "שביעי של פסח";
        if (dd > 15 && dd < 21) {
            Line6 += (day_ptr === 7) ? "שבת חול המועד פסח" : "חול המועד פסח";
        }
        Line6 += " " + Haftara9[1];
    }

    // Iyar (Yom HaZikaron / Atzmaut)
    if (mm === (7 + Meuberet)) {
        if ((dd === 3 || dd === 2) && day_ptr === 4) Line6 += Haftara8[1] + " " + Haftara9[3];
        if ((dd === 4 || dd === 3) && day_ptr === 5) Line6 += Haftara8[0] + " " + Haftara9[3];
        if (dd === 5 && day_ptr === 2) Line6 += Haftara8[1] + " " + Haftara9[2];
        if (dd === 6 && day_ptr === 3) Line6 += Haftara8[0] + " " + Haftara9[2];
        if (dd === 4 && day_ptr === 4) Line6 += " יום הזכרון ";
        if (dd === 5 && day_ptr === 5) Line6 += Haftara8[1] + " " + Haftara9[1];
        if (dd === 14) Line6 += Haftara7[0] + Haftara6[1] + " " + Haftara9[1];
    }

    // Sivan, Tamuz, Av, Elul
    if (mm === (8 + Meuberet)) {
        if (dd === 6) Line6 += " חג שבועות ";
        if (dd > 1 && dd <= 12 && dd !== 6) Line6 += " " + Haftara9[1];
    }
    if (mm === (9 + Meuberet)) {
        if (dd === 17 && day_ptr !== 7) Line6 += Haftara10[0];
        if (dd === 18 && day_ptr === 1) Line6 += Haftara10[0] + " " + Haftara9[2];
    }
    if (mm === (10 + Meuberet)) {
        if (dd === 9 && day_ptr !== 7) Line6 += Haftara9[1];
        if (dd === 10 && day_ptr === 1) Line6 += Haftara9[1] + " " + Haftara9[2];
        if (dd === 15) Line6 += " " + Haftara11[2] + " " + Haftara9[1];
    }
    if (mm === (11 + Meuberet) && dd === 29) Line6 += " " + Haftara9[1];

    // --- Counters (Omer & Avot) ---
    if (Omer > 0) {
        Line6 += ` ${hebrew_numbers[Omer - 1]} ימים לעומר `;
    }

    if (Avot > 0 && day_ptr === 7) {
        Line6 += ` ${Haftara8[2]} ${hebrew_numbers[Avot - 1]}`;
    }

    return Line6.trim();
}

export function is_Meuberet(Meuberet, week_ptr_parasha, Siman) {
    if (Meuberet) {
        if (((Siman === 582) || (Siman === 387) || (Siman === 537)) && (week_ptr_parasha === 38)) return true;
        return false;
    } else {
        if ((Siman !== 135) && (week_ptr_parasha === 21)) return true;
        if ((Siman !== 725) && (week_ptr_parasha === 31)) return true;
        if ([26, 28, 38].includes(week_ptr_parasha)) return true;
        return false;
    }
}

function szfh_haft(Haber, week_ptr_parasha, SZFHindex2) {
    let PP = "";
    let local_ptr = week_ptr_parasha;
    if (Haber) {
        PP = Parasha[local_ptr++] + "+" + Parasha[local_ptr];
    } else {
        PP = Parasha[local_ptr];
    }
    PP += " " + SZFH[SZFHindex2] + " " + SZFHsrc[SZFHindex2];
    return { text: PP, nextIndex: SZFHindex2 + 1 };
}

function szfh_haft2(Haber, week_ptr_parasha, SZFHindex2) {
    let P1, P2;
    let PP = "";

    // Logic for joined Parashiot (Haber)
    if (Haber) {
        // We use index and index + 1
        P1 = Parasha[week_ptr_parasha];
        let P1_next = Parasha[week_ptr_parasha + 1];
        PP = P1 + "+" + P1_next;
        // We increment the pointer logic externally or handle it in the loop
    } else {
        P1 = Parasha[week_ptr_parasha];
        PP = P1;
    }

    P2 = SZFHsrc[SZFHindex2];
    P1 = SZFH[SZFHindex2];

    // Increment the index
    let newIndex = SZFHindex2 + 1;

    // Equivalent to stradd(PP, P1, ' ', 1) then P2
    PP = PP + " " + P1 + " " + P2;

    return {
        PP: PP,
        newIndex: newIndex
    };
}

export /**
 * Translated from calc_year.cpp
 * Logic: Line-by-line migration from C++ to JavaScript
 */

    function calc_year(now) {
    // --- 1. Variables and Initial Setup ---
    let i, y_ptr, SZFHrow;
    let Ner_chanuka = 0, Omer = 0, Avot = -1;
    let shabbatotList = [];
    // short Calendar[383][7]
    let Calendar = Array.from({ length: 383 }, () => Array(7).fill(0));
    let Hyear = "";

    // Reference dates from C++
    let now0 = { day: 3, month: 10, year: 2024, hour: 18, minute: 0, second: 0 };
    let now4heb = { day: 3, month: 10, year: 2024, hour: 18, minute: 0, second: 0 };

    let Mptr0, Mprt12, days, Y4, Meuberet, SHK, day_ptr;
    let week_ptr = 0, week_ptr_parasha = 0, week_ptr_haftara = 0, AccDays = 0;

    const HebMonthLen12 = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
    const HebMonthLen13 = [30, 29, 30, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29];

    let MonLen, mm, dd, rosh, Siman, Nmonths, SZFHindex2 = 0, SZFHindex = 0, days_count = 0;

    let Haber = false, Hanucka = false, Hanucka2 = false, SZFHflag = false, save_porosho = false;
    let debug_p = false, summer = false;

    let PP = "", Line1 = "", Line2 = "", Line3 = "", Line4 = "", Line5 = "", Line6 = "";

    let sunset_h, sunset_m, sunrise_h, sunrise_m, ss, sr, shabat_h, shabat_m, motsash_h, motsash_m;
    const shabat_offset = [-40, -20, -20, -30, -30];
    const sunrise_offset = [[0, 9, 10, -2, 8], [0, 7, 6, 4, 0], [0, 5, 3, 3, -1], [0, 7, 6, 4, 0]];
    const sunset_offset = [[0, 0, 0, -3, -8], [0, 0, 4, -3, -2], [0, 1, -1, -3, 1], [0, 0, 4, -3, -2]];

    let ofek = 0;
    let d = now.day, m = now.month, y = now.year, sso = 0, sro = 0;

    // --- 2. Sunrise/Sunset and Zmanim logic ---
    sro = sunrise_offset[Math.floor((m - 1) / 3)][ofek];
    sso = sunset_offset[Math.floor((m - 1) / 3)][ofek];

    // Accessing imported Jerusalem tables
    sr = SunriseJerusalem[(m - 1) * 31 + d - 1] + sro;
    ss = SunsetJerusalem[(m - 1) * 31 + d - 1] + sso;

    summer = is_summer_clock(d, m, y);
    if (summer) { ss += 60; sr += 60; }

    sunset_h = Math.floor(ss / 60);
    sunset_m = ss % 60;
    sunrise_h = Math.floor(sr / 60);
    sunrise_m = sr % 60;

    shabat_h = Math.floor((ss + shabat_offset[ofek]) / 60);
    shabat_m = (ss + shabat_offset[ofek]) % 60;
    motsash_h = Math.floor((ss + 40) / 60);
    motsash_m = (ss + 40) % 60;

    // Transition to next Hebrew day if after sunset
    if ((now.hour * 60 + now.minute) >= ((12 + sunset_h) * 60 + sunset_m)) {
        now4heb = add_day_logic(now); // helper to increment day
        d = now4heb.day;
    }

    // --- 3. Pointer and Year calculation ---
    y_ptr = y - now0.year;
    if (100 * m + d < 100 * Month[y_ptr] + Day[y_ptr]) {
        y_ptr--;
        Mptr0 = Month[y_ptr] - Month_buffer[0];
    } else {
        Mptr0 = Month[y_ptr] - Month_buffer[0] + 12;
    }
    Y4 = now0.year + y_ptr + 1;

    // Leap year check for secular Feb (index 6 in your Month_len table)
    Month_len[6] = (((Y4 % 400) === 0) || (((Y4 % 4) === 0) && ((Y4 % 100) !== 0))) ? 29 : 28;

    Mprt12 = (m + 4);
    days = d - Day[y_ptr];
    while (Mptr0 < Mprt12) { days += Month_len[Mptr0++]; }

    Siman = YearSign[y_ptr];
    SHK = Math.floor((Siman / 10) % 10);
    Meuberet = Meuberet_arr[y_ptr];
    MonLen = Meuberet ? [...HebMonthLen13] : [...HebMonthLen12]; // Clone array
    Nmonths = 12 + Meuberet;

    if (SHK === 3) MonLen[1] = 30;
    else if (SHK === 8) MonLen[2] = 29;

    day_ptr = (YearSign[y_ptr] % 10);
    rosh = day_ptr;

    // --- 4. Main Hebrew Calendar Loop ---
    for (mm = 0; mm < Nmonths; mm++) {
        for (dd = 1; dd <= MonLen[mm]; dd++) {

            if (debug_p) Calendar[week_ptr][day_ptr - 1] = dd;

            // Shabbat Logic
            if (day_ptr === 7) {
                if (week_ptr === 0) {
                    if (rosh === 2 || rosh === 3) PP = Parasha[51] + " " + Haftara[51];
                    else if (rosh === 5) PP = Parasha[52] + " " + Haftara[51];
                    else PP = Parasha[52] + " " + Haftara[52];
                } else if (week_ptr === 1) {
                    PP = (dd === 10) ? "כיפור" : Parasha[52] + " " + Haftara[52];
                } else if (week_ptr === 2) {
                    PP = (dd === 15) ? "סוכות" : " חול המועד";
                } else if (week_ptr === 3 && dd === 22) {
                    PP = "שמחת תורה";
                } else {
                    // Regular and Four Parashiyot (SZFH) logic
                    if (((dd === 1) && (mm === (5 + Meuberet))) || ((dd >= 25) && (mm === (4 + Meuberet)))) {
                        SZFHflag = true;
                        if (dd === 27 || dd === 29) SZFHrow = 0;
                        else if (dd === 25) SZFHrow = 1;
                        else SZFHrow = 2;
                    }

                    Haber = is_Meuberet(Meuberet, week_ptr_parasha, Siman);
                    if (Haber) week_ptr_haftara++;

                    if ((mm === (Nmonths - 1)) && (dd === 23 || dd === 25)) {
                        Haber = true; week_ptr_haftara = week_ptr_parasha;
                    }
                    if (mm === 2 && dd >= 25) {
                        Hanucka = true;
                        if (dd === 25) Hanucka2 = true;
                        week_ptr_haftara = 35;
                    }
                    if (mm === 3 && Hanucka2) {
                        Hanucka2 = false; week_ptr_haftara = 22;
                    }

                    // String assembly for PP
                    if (Haber && !SZFHflag) {
                        PP = Parasha[week_ptr_parasha++] + "+" + Parasha[week_ptr_parasha] + " " + Haftara[week_ptr_haftara];
                    } else if (mm === (6 + Meuberet) && (dd <= 21 && dd >= 15)) {
                        PP = pesach_haft(dd, week_ptr_parasha);
                        week_ptr_parasha--;
                    } else if (SZFHflag) {
                        if (SZFHarray[SZFHrow][SZFHindex]) {
                            let sz_res = szfh_haft(Haber, week_ptr_parasha, SZFHindex2);
                            PP = sz_res.PP;
                            SZFHindex2 = sz_res.nextIndex;
                            if (SZFHindex2 === 5) SZFHflag = false;
                            SZFHindex++;
                        } else {
                            PP = Parasha[week_ptr_parasha] + " " + Haftara[week_ptr_haftara];
                            SZFHindex++;
                        }
                    } else {
                        // Regular week or Rosh Chodesh Haftara
                        if (dd === 29 && mm < (Nmonths - 2) && !Hanucka) {
                            PP = `${Parasha[week_ptr_parasha]} ${Haftara2[0]} ${Haftara2src[0]}`;
                        } else if ((dd === 30 || dd === 1) && mm < (Nmonths - 2) && !Hanucka) {
                            PP = `${Parasha[week_ptr_parasha]} ${Haftara2[1]} ${Haftara2src[1]}`;
                        } else {
                            PP = Parasha[week_ptr_parasha] + " " + Haftara[week_ptr_haftara];
                        }
                    }

                    if (save_porosho) {
                        Line3 = Parasha[week_ptr_parasha] + "  " + Haftara[week_ptr_parasha];
                        Line5 = PP; save_porosho = false;
                    }
                    week_ptr_parasha++;
                    week_ptr_haftara = week_ptr_parasha;
                }



                shabbatotList.push({
                    month: mm,
                    day: dd,
                    parasha: PP
                });

                week_ptr++;
            }



            // --- 5. Merged Counters (The logic you asked to "Inside?") ---
            // Chanuka
            if (Ner_chanuka) Ner_chanuka++;
            if (mm === 2 && dd === 25) Ner_chanuka++;
            if (Ner_chanuka > 8) Ner_chanuka = 0;

            // Omer
            if (Omer) Omer++;
            if (mm === (6 + Meuberet) && dd === 16) Omer++;
            if (Omer > 49) Omer = 0;

            // Avot
            if (Avot > -1 && day_ptr === 7) Avot++;
            if (mm === (6 + Meuberet) && dd > 16 && day_ptr === 7 && Avot < 0) Avot++;
            if (Avot > 6) Avot = -1;

            // --- 6. Output Construction for Target Day ---
            if (days_count === days) {
                Line6 = day_info_str_js(dd, mm, day_ptr, Meuberet, Ner_chanuka, Omer, Avot);
                if (day_ptr < 7) {
                    save_porosho = true;
                } else {
                    Line3 = Parasha[week_ptr_parasha - 1] + "  " + Haftara[week_ptr_parasha - 1];
                    Line5 = PP;
                }

                Line1 = `${Yom[day_ptr - 1]} ${hebrew_numbers[dd - 1]} ${Meuberet ? Hodesh13[mm] : Hodesh12[mm]} `;
                Line1 += `${Convert_year2letters(y_ptr + 5785)} ${Convert_year2letters(y_ptr + 2336)} `;
                Line1 += `${now.day}.${now.month}.${now.year}`;

                Line2 = ` Time - ${now.hour.toString().padStart(2, '0')}:${now.minute.toString().padStart(2, '0')}:${now.second.toString().padStart(2, '0')}`;

                if (day_ptr === 6 || day_ptr === 7) {
                    Line4 = ` כניסת שבת ${shabat_h}:${shabat_m.toString().padStart(2, '0')} מוצאי שבת ${motsash_h}:${motsash_m.toString().padStart(2, '0')}`;
                } else {
                    Line4 = ` זריחה ${sunset_h}:${sunset_m.toString().padStart(2, '0')} שקיעה ${sunrise_h}:${sunrise_m.toString().padStart(2, '0')}`;
                }
            }

            day_ptr++;
            if (day_ptr === 8) day_ptr = 1;
            days_count++;
        }
    }
    return {
        monthLengths: MonLen,    // Array: [30, 29, 30...]
        startDay: rosh,          // 1 (Sun) to 7 (Sat)
        isMeuberet: Meuberet,    // Boolean
        shabbatot: shabbatotList // Array of {month, day, parasha}
    };
}