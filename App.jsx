import { useEffect, useMemo, useState } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1457269449834-928af64c684d?auto=format&fit=crop&w=1200&q=80",
];

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const isSameDay = (a, b) =>
  !!a && !!b &&
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

const getFirstWeekday = (year, month) => {
  const jsDay = new Date(year, month, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
};

const buildCalendarCells = (year, month) => {
  const firstWeekday = getFirstWeekday(year, month);
  const daysInMonth = getDaysInMonth(year, month);
  const cells = [];

  const prevMonthDate = month === 0 ? new Date(year - 1, 11, 1) : new Date(year, month - 1, 1);
  const prevMonthDays = getDaysInMonth(prevMonthDate.getFullYear(), prevMonthDate.getMonth());

  for (let i = 0; i < firstWeekday; i++) {
    const day = prevMonthDays - firstWeekday + i + 1;
    const cellDate = new Date(year, month, 1 - (firstWeekday - i));
    cells.push({ date: cellDate, day, muted: true });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, month, day), day, muted: false });
  }

  while (cells.length % 7 !== 0 || cells.length < 42) {
    const nextDay = cells.length - (firstWeekday + daysInMonth) + 1;
    const cellDate = new Date(year, month + 1, nextDay);
    cells.push({ date: cellDate, day: nextDay, muted: true });
  }

  return cells;
};

export default function App() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [rangeStart, setRangeStart] = useState(null);
  const [rangeEnd, setRangeEnd] = useState(null);
  const [monthMemo, setMonthMemo] = useState("");
  const [rangeNote, setRangeNote] = useState("");
  const [savedNotes, setSavedNotes] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const heroImage = HERO_IMAGES[month];
  const storageKey = `calendar-notes-${year}-${month}`;

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      setMonthMemo(parsed.monthMemo || "");
      setSavedNotes(parsed.savedNotes || {});
    } else {
      setMonthMemo("");
      setSavedNotes({});
    }
    setRangeStart(null);
    setRangeEnd(null);
    setRangeNote("");
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ monthMemo, savedNotes }));
  }, [storageKey, monthMemo, savedNotes]);

  const selectedKey = useMemo(() => {
    if (!rangeStart) return "";
    const startKey = formatDateKey(rangeStart);
    const endKey = formatDateKey(rangeEnd || rangeStart);
    return `${startKey}__${endKey}`;
  }, [rangeStart, rangeEnd]);

  useEffect(() => {
    setRangeNote(savedNotes[selectedKey]?.text || "");
  }, [selectedKey, savedNotes]);

  const cells = useMemo(() => buildCalendarCells(year, month), [year, month]);

  const rangeInfo = useMemo(() => {
    if (!rangeStart) return null;
    const a = rangeStart;
    const b = rangeEnd || rangeStart;
    return a <= b ? { start: a, end: b } : { start: b, end: a };
  }, [rangeStart, rangeEnd]);

  const inRange = (date) => {
    if (!rangeInfo) return false;
    return date >= rangeInfo.start && date <= rangeInfo.end;
  };

  const handleDayClick = (date) => {
    const clicked = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(clicked);
      setRangeEnd(null);
      return;
    }
    if (clicked < rangeStart) {
      setRangeEnd(rangeStart);
      setRangeStart(clicked);
    } else {
      setRangeEnd(clicked);
    }
  };

  const saveSelectedNote = () => {
    if (!selectedKey) return;
    setSavedNotes((prev) => ({
      ...prev,
      [selectedKey]: {
        text: rangeNote,
        label: rangeStart && rangeEnd
          ? `${formatDateKey(rangeInfo.start)} to ${formatDateKey(rangeInfo.end)}`
          : formatDateKey(rangeStart),
      },
    }));
  };

  const clearSelection = () => {
    setRangeStart(null);
    setRangeEnd(null);
    setRangeNote("");
  };

  const deleteSelectedNote = () => {
    if (!selectedKey) return;
    setSavedNotes((prev) => {
      const next = { ...prev };
      delete next[selectedKey];
      return next;
    });
    setRangeNote("");
  };

  const goMonth = (step) => {
    setCurrentDate(new Date(year, month + step, 1));
  };

  const sortedNotes = Object.entries(savedNotes || {}).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  const styles = {
    page: {
      minHeight: "100vh",
      background: darkMode ? "#020617" : "#f5f5f4",
      color: darkMode ? "#f8fafc" : "#0f172a",
      padding: "20px",
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    topBar: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      flexWrap: "wrap",
      marginBottom: "24px",
    },
    button: {
      padding: "10px 14px",
      borderRadius: "12px",
      border: "1px solid #cbd5e1",
      background: darkMode ? "#0f172a" : "#ffffff",
      color: darkMode ? "#f8fafc" : "#0f172a",
      cursor: "pointer",
    },
    mainGrid: {
      display: "grid",
      gridTemplateColumns: "1.6fr 1fr",
      gap: "24px",
    },
    panel: {
      background: darkMode ? "#0f172a" : "#ffffff",
      border: "1px solid #cbd5e1",
      borderRadius: "28px",
      overflow: "hidden",
      boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },
    heroWrap: {
      display: "grid",
      gridTemplateColumns: "1.1fr 1fr",
    },
    hero: {
      minHeight: "520px",
      position: "relative",
      backgroundImage: `url(${heroImage})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    overlayText: {
      position: "absolute",
      bottom: "24px",
      left: "24px",
      color: "white",
      textShadow: "0 2px 12px rgba(0,0,0,0.4)",
    },
    calendarBody: {
      padding: "24px",
    },
    weekdayRow: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "8px",
      marginBottom: "8px",
      textAlign: "center",
      fontSize: "12px",
      fontWeight: "bold",
    },
    daysGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      gap: "8px",
    },
    dayBtn: {
      height: "56px",
      borderRadius: "16px",
      border: "1px solid #cbd5e1",
      cursor: "pointer",
      fontWeight: "bold",
      position: "relative",
    },
    sideCard: {
      background: darkMode ? "#0f172a" : "#ffffff",
      border: "1px solid #cbd5e1",
      borderRadius: "24px",
      padding: "18px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      borderRadius: "16px",
      border: "1px solid #cbd5e1",
      padding: "12px",
      fontFamily: "Arial, sans-serif",
      resize: "vertical",
      background: darkMode ? "#111827" : "#ffffff",
      color: darkMode ? "#f8fafc" : "#0f172a",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.topBar}>
          <div>
            <div style={{ fontSize: "12px", letterSpacing: "2px", marginBottom: "8px" }}>
              INTERACTIVE CALENDAR CHALLENGE
            </div>
            <h1 style={{ margin: 0 }}>Wall Calendar Aesthetic with Range Notes</h1>
            <p style={{ opacity: 0.8 }}>
              Responsive interactive calendar with date range selection and notes.
            </p>
          </div>

          <button style={styles.button} onClick={() => setDarkMode((v) => !v)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div style={styles.mainGrid}>
          <div style={styles.panel}>
            <div style={styles.heroWrap}>
              <div style={styles.hero}>
                <div style={styles.overlayText}>
                  <div style={{ fontSize: "12px", letterSpacing: "2px" }}>WALL CALENDAR</div>
                  <h2 style={{ fontSize: "42px", margin: "8px 0" }}>{MONTHS[month]}</h2>
                  <div>{year}</div>
                </div>
              </div>

              <div style={styles.calendarBody}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", gap: "8px", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>CURRENT MONTH</div>
                    <h3 style={{ margin: "6px 0" }}>{MONTHS[month]} {year}</h3>
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={styles.button} onClick={() => goMonth(-1)}>Prev</button>
                    <button style={styles.button} onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}>Today</button>
                    <button style={styles.button} onClick={() => goMonth(1)}>Next</button>
                  </div>
                </div>

                <div style={styles.weekdayRow}>
                  {WEEKDAYS.map((day) => <div key={day}>{day}</div>)}
                </div>

                <div style={styles.daysGrid}>
                  {cells.map((cell, idx) => {
                    const todayMatch = isSameDay(cell.date, today);
                    const startMatch = rangeInfo && isSameDay(cell.date, rangeInfo.start);
                    const endMatch = rangeInfo && isSameDay(cell.date, rangeInfo.end);
                    const insideRange = inRange(cell.date);

                    let bg = darkMode ? "#0f172a" : "#ffffff";
                    let color = darkMode ? "#f8fafc" : "#0f172a";
                    let opacity = cell.muted ? 0.4 : 1;

                    if (insideRange) {
                      bg = "#dbeafe";
                      color = "#0f172a";
                    }
                    if (startMatch || endMatch) {
                      bg = "#0284c7";
                      color = "white";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleDayClick(cell.date)}
                        style={{
                          ...styles.dayBtn,
                          background: bg,
                          color,
                          opacity,
                          outline: todayMatch ? "2px solid #38bdf8" : "none",
                        }}
                      >
                        {cell.day}
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "18px", padding: "14px", borderRadius: "18px", background: darkMode ? "#1e293b" : "#f1f5f9" }}>
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>SELECTION</div>
                  <div style={{ fontWeight: "bold", marginTop: "6px" }}>
                    {!rangeStart
                      ? "No date selected"
                      : !rangeEnd
                      ? formatDateKey(rangeStart)
                      : `${formatDateKey(rangeInfo.start)} to ${formatDateKey(rangeInfo.end)}`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gap: "18px" }}>
            <div style={styles.sideCard}>
              <h3>Monthly Memo</h3>
              <textarea
                style={styles.textarea}
                value={monthMemo}
                onChange={(e) => setMonthMemo(e.target.value)}
                placeholder="Add reminders or notes for this month..."
              />
            </div>

            <div style={styles.sideCard}>
              <h3>Date-specific Notes</h3>
              <textarea
                style={styles.textarea}
                value={rangeNote}
                onChange={(e) => setRangeNote(e.target.value)}
                placeholder="Write note for selected date/range..."
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
                <button style={styles.button} onClick={saveSelectedNote}>Save Note</button>
                <button style={styles.button} onClick={deleteSelectedNote}>Delete</button>
                <button style={styles.button} onClick={clearSelection}>Clear</button>
              </div>
            </div>

            <div style={styles.sideCard}>
              <h3>Saved Notes</h3>
              {sortedNotes.length === 0 ? (
                <p style={{ opacity: 0.7 }}>No saved notes yet.</p>
              ) : (
                sortedNotes.map(([key, value]) => (
                  <div key={key} style={{ border: "1px solid #cbd5e1", borderRadius: "16px", padding: "12px", marginBottom: "10px" }}>
                    <div style={{ fontWeight: "bold", marginBottom: "6px" }}>{value?.label || "Saved Note"}</div>
                    <div style={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>{value?.text || ""}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
