/**
 * DateTime.js
 */
export class DateTime {
    constructor(d, m, y, h = 0, min = 0, s = 0) {
        this.day = d;
        this.month = m;
        this.year = y;
        this.hour = h;
        this.minute = min;
        this.second = s;
    }

    add_day() {
        const date = new Date(this.year, this.month - 1, this.day);
        date.setDate(date.getDate() + 1);
        this.day = date.getDate();
        this.month = date.getMonth() + 1;
        this.year = date.getFullYear();
    }

    add_year() {
        this.year++;
    }

    updateTime(ms) {
        let totalSeconds = this.second + Math.floor(ms / 1000);
        this.second = totalSeconds % 60;
        let totalMinutes = this.minute + Math.floor(totalSeconds / 60);
        this.minute = totalMinutes % 60;
        let totalHours = this.hour + Math.floor(totalMinutes / 60);
        this.hour = totalHours % 24;
        if (totalHours >= 24) this.add_day();
    }
}