import React, { useState, useEffect } from 'react';
import { DateTime } from './DateTime';
import { calc_year } from './CalcYear';
import { Hodesh12, Hodesh13, Yom } from './HebcalTables';

const App = () => {
  const [grid, setGrid] = useState([]);
  const [monthTitle, setMonthTitle] = useState("");
  const [hYear, setHYear] = useState("");

  useEffect(() => {
    // 1. Setup today's date (Feb 14, 2026)
    const today = new Date();
    const now = new DateTime(
      today.getDate(),
      today.getMonth() + 1, // JS Months are 0-indexed
      today.getFullYear(),
      today.getHours(),
      today.getMinutes()
    );

    const yearData = calc_year(now);

    // Set Year String (e.g., תשפ"ו)
    setHYear("תשפ״ו");

    // 2. Focus on Shevat (Index 4)
    const targetMonthIdx = 4;

    // Calculate the weekday for the 1st of Shevat
    let totalDaysToMonth = 0;
    for (let i = 0; i < targetMonthIdx; i++) {
      totalDaysToMonth += yearData.monthLengths[i];
    }
    const firstWeekday = ((yearData.startDay - 1 + totalDaysToMonth) % 7) + 1;

    // 3. Anchor Gregorian Date
    // 1 Tishrei 5786 was Sept 23, 2025.
    // We calculate the Gregorian date by adding the total days passed to that anchor.
    const anchorDate = new Date(2025, 8, 23); // Sept 23
    anchorDate.setDate(anchorDate.getDate() + totalDaysToMonth);

    const cells = [];
    // Sunday - firstWeekday padding
    for (let i = 1; i < firstWeekday; i++) cells.push({ empty: true });

    // Fill the month
    for (let d = 1; d <= yearData.monthLengths[targetMonthIdx]; d++) {
      const shabbatInfo = yearData.shabbatot.find(s => s.month === targetMonthIdx && s.day === d);

      const currentGreg = new Date(anchorDate);
      currentGreg.setDate(currentGreg.getDate() + (d - 1));
      const isShabbat = ((firstWeekday + d - 2) % 7) + 1 === 7;
      cells.push({
        hebDay: d,
        hebLetter: getHebrewLetter(d),
        gregDay: currentGreg.getDate(),
        gregMonth: currentGreg.getMonth() + 1,
        parasha: isShabbat && shabbatInfo ? shabbatInfo.parasha : null,
        isShabbat: isShabbat,
        isToday: currentGreg.toDateString() === today.toDateString()
      });
    }

    while (cells.length < 42) cells.push({ empty: true });

    setGrid(cells);
    setMonthTitle(yearData.isMeuberet ? Hodesh13[targetMonthIdx] : Hodesh12[targetMonthIdx]);
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.hYear}>{hYear}</div>
        <div style={styles.hMonth}>חודש {monthTitle}</div>
      </div>

      <div style={styles.grid}>
        {Yom.map(y => <div key={y} style={styles.headerCell}>{y}</div>)}
        {grid.map((cell, idx) => (
          <div key={idx} style={{
            ...styles.dayCell,
            backgroundColor: cell.isToday ? '#fffde7' : (cell.isShabbat ? '#f0f7ff' : '#fff'),
            border: cell.isToday ? '2px solid #fbc02d' : '1px solid #eee'
          }}>
            {!cell.empty && (
              <>
                <div style={styles.topRow}>
                  <span style={styles.hebLetter}>{cell.hebLetter}</span>
                  <span style={styles.gregDate}>{cell.gregDay}/{cell.gregMonth}</span>
                </div>
                {cell.parasha && <div style={styles.parasha}>{cell.parasha}</div>}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const getHebrewLetter = (n) => {
  if (n === 15) return "טו";
  if (n === 16) return "טז";
  const units = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל"];
  return (tens[Math.floor(n / 10)] || "") + (units[n % 10] || "");
};

const styles = {
  container: { direction: 'rtl', padding: '20px', fontFamily: 'Arial', maxWidth: '1000px', margin: '0 auto' },
  header: { textAlign: 'center', marginBottom: '20px' },
  hYear: { fontSize: '2rem', fontWeight: 'bold', color: '#333' },
  hMonth: { fontSize: '1.2rem', color: '#666' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', border: '2px solid #333', borderRadius: '8px', overflow: 'hidden' },
  headerCell: { background: '#333', color: '#fff', padding: '10px', textAlign: 'center' },
  dayCell: { height: '120px', padding: '8px', display: 'flex', flexDirection: 'column', border: '0.5px solid #ddd' },
  topRow: { display: 'flex', justifyContent: 'space-between' },
  hebLetter: { fontSize: '1.4rem', fontWeight: 'bold' },
  gregDate: { fontSize: '0.8rem', color: '#999' },
  parasha: { marginTop: 'auto', fontSize: '0.85rem', color: '#c62828', fontWeight: 'bold', textAlign: 'center' }
};

export default App;