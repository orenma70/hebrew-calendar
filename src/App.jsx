import React, { useState, useMemo } from 'react';
import { HDate, Sedra, Locale } from '@hebcal/core';
import './App.css';

// At the very top of your App function, define today's date once



function App() {
  const [currentDate, setCurrentDate] = useState(new HDate().onOrBefore(1));
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const todayDate = new HDate();
  const calendarGrid = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const sedra = new Sedra(year, true);

    const firstOfMonth = new HDate(1, month, year);
    const daysInMonth = firstOfMonth.daysInMonth();
    const startDayOfWeek = firstOfMonth.abs() % 7;

    const grid = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      grid.push({ empty: true });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new HDate(d, month, year);
      const dayOfWeek = date.abs() % 7;
      const gregDate = date.greg(); // Get the Gregorian JS Date object


      const isToday = date.abs() === todayDate.abs();

      // Inside your loop for filling actual days
      let parshaHe = '';
      if (dayOfWeek === 6) {
        const p = sedra.lookup(date);

        // 1. Convert everything to an array first to handle single/double parshiot the same way
        const pArray = Array.isArray(p) ? p : [p];

        // 2. Map through the array and extract the name if it's an object
        parshaHe = pArray
          .map(item => {
            if (!item) return '';
            // If it's an object (the source of your crash), get the name property
            const name = typeof item === 'object' ? (item.parsha || item.name || '') : item;
            return Locale.gettext(name, 'he'); // Convert to Hebrew
          })
          .filter(Boolean) // Remove empty strings
          .join(' - ');
      }

      grid.push({
        dayNum: date.renderGematriya().split(' ')[0],
        gregDay: gregDate.getDate(), // e.g., 12
        fullDate: date,
        parsha: parshaHe,
        isToday: isToday
      });
    }

    while (grid.length < 42) {
      grid.push({ empty: true });
    }

    return grid;
  }, [currentDate]);

  return (
    <div className="calendar-container">
      <header className="calendar-header">
        <h1>{currentDate.render('he').split(' ').slice(1).join(' ')}</h1>
        <div className="nav-buttons">
          {/* Move back exactly 1 month */}
          <button onClick={() => setCurrentDate(prev => prev.add(-1, 'month'))}>&gt; חודש קודם</button>

          <button onClick={() => setCurrentDate(new HDate().onOrBefore(1))} className="today-btn">היום</button>

          {/* Move forward exactly 1 month */}
          <button onClick={() => setCurrentDate(prev => prev.add(1, 'month'))}>חודש הבא &lt;</button>
        </div>
      </header>

      <div className="calendar-wrapper">
        <div className="grid-header">
          {days.map(d => <div key={d} className="weekday-label">{d}</div>)}
        </div>

        <div className="calendar-grid">
          {calendarGrid.map((day, index) => (
            /* This is the main wrapper for the square - we add today-cell here */
            <div
              key={index}
              className={`day-cell 
        ${day.empty ? 'empty' : ''} 
        ${day.isToday ? 'today-cell' : ''} 
        ${day.parsha ? 'shabbat-cell' : ''}`
              }
            >
              {!day.empty && (
                <>
                  <div className="day-top-row">
                    <span className="day-number">{day.dayNum}</span>
                    <span className="greg-number">{day.gregDay}</span>
                  </div>

                  {day.parsha && (
                    <div className="parsha-tag">
                      <strong>פרשת:</strong><br />
                      {day.parsha}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;