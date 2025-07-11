"use client";
import React from "react";

const colorScale = [
  "#e5e7eb", // 0 - Absent (gray)
  "#2563eb", // 1 - Present (primary)
  "#60a5fa", // 2 - Late (lighter primary)
  "#fbbf24", // 3 - Excused (yellow)
  "#f3f4f6", // 4 - No School (lightest gray)
  "#d1fae5", // 5 - Weekend (distinct green)
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const termWeeks = 14;

// Generate mock data for a term (14 weeks x 7 days)
const generateTermAttendance = (startDate = new Date()) => {
  // Find the previous Monday
  const start = new Date(startDate);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const data: { date: string; value: number; isWeekend: boolean }[][] = [];
  for (let w = 0; w < termWeeks; w++) {
    const week: { date: string; value: number; isWeekend: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const day = new Date(start);
      day.setDate(start.getDate() + w * 7 + d);
      const dayOfWeek = day.getDay();
      let value;
      let isWeekend = false;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        value = 5; // Weekend
        isWeekend = true;
      } else {
        value = Math.random() < 0.8 ? Math.floor(Math.random() * 3) + 1 : 0;
      }
      week.push({ date: day.toISOString().slice(0, 10), value, isWeekend });
    }
    data.push(week);
  }
  return data;
};

const termData = generateTermAttendance();

function getWeekRange(week: { date: string }[]) {
  if (!week.length) return '';
  const start = new Date(week[0].date);
  const end = new Date(week[6].date);
  return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

export default function AttendanceTermGrid({
  data = termData,
}: {
  data?: { date: string; value: number; isWeekend: boolean }[][];
}) {
  // Calculate summary
  const flat = data.flat();
  const summary = flat.reduce(
    (acc, d) => {
      if (d.value === 5) acc.weekend++;
      else if (d.value === 4) acc.noSchool++;
      else if (d.value === 0) acc.absent++;
      else if (d.value === 1) acc.present++;
      else if (d.value === 2) acc.late++;
      else if (d.value === 3) acc.excused++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, noSchool: 0, weekend: 0 }
  );
  const totalSchoolDays = flat.length - summary.noSchool - summary.weekend;

  return (
    <div className="w-full">
      <div className="relative w-full max-w-full pb-4">
        <div className="flex flex-col items-center min-w-0">
          {/* Week labels */}
          <div
            className="grid mb-2"
            style={{
              gridTemplateColumns: `48px repeat(${data.length}, 1fr)`,
              width: '100%',
              minWidth: 0,
              gap: '2px',
            }}
          >
            <div></div> {/* Spacer for sticky day labels */}
            {data.map((week, wi) => (
              <div key={wi} className="text-xs font-bold text-primary text-center truncate">
                Week {wi + 1}
              </div>
            ))}
          </div>
          {/* Attendance grid */}
          <div
            className="grid"
            style={{
              gridTemplateColumns: `48px repeat(${data.length}, 1fr)`,
              width: '100%',
              minWidth: 0,
              gap: '2px',
            }}
          >
            {/* Day labels sticky on the left */}
            <div className="flex flex-col justify-between bg-white" style={{ height: 20 * 7, width: 48, borderRight: '2px solid #e5e7eb' }}>
              {daysOfWeek.map((d) => (
                <div key={d} className="text-xs text-muted-foreground font-medium" style={{ height: 20, lineHeight: "20px", width: 48, textAlign: 'right', paddingRight: 8 }}>{d[0]}</div>
              ))}
            </div>
            {/* Weeks */}
            {data.map((week, wi) => (
              <div
                key={wi}
                className="flex flex-col items-center"
                style={{ border: '2px solid #2563eb', background: wi % 2 === 0 ? '#f8fafc' : '#fff', minWidth: 0, boxShadow: '0 2px 8px 0 rgba(37,99,235,0.07)' }}
              >
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date}: ${["Absent", "Present", "Late", "Excused", "No School", "Weekend"][day.value]}`}
                    style={{
                      width: '100%',
                      minWidth: 12,
                      maxWidth: 28,
                      height: 20,
                      background: colorScale[day.value],
                      border: day.isWeekend ? '2px solid #10b981' : '1px solid #e5e7eb',
                      position: 'relative',
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {day.isWeekend && (
                      <span style={{
                        position: 'absolute',
                        top: 2,
                        right: 2,
                        width: 12,
                        height: 12,
                        background: '#2563eb',
                        color: '#fff',
                        fontWeight: 'bold',
                        fontSize: 10,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 2px 0 rgba(37,99,235,0.10)',
                      }}>W</span>
                    )}
                  </div>
                ))}
                {/* Week range label */}
                <div className="text-[10px] text-primary/80 mt-1 mb-1 text-center font-medium w-full truncate">
                  {getWeekRange(week)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Legend and summary */}
      <div className="flex gap-4 mt-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[1], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Present</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[2], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Late</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[3], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Excused</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[0], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Absent</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[4], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> No School</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[5], display: 'inline-block', border: '2px solid #10b981' }}><span style={{ position: 'absolute', fontSize: 10, color: '#047857', fontWeight: 'bold', lineHeight: '10px' }}>W</span></span> Weekend</div>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-primary font-semibold">
        <div>Total School Days: <span className="text-foreground">{totalSchoolDays}</span></div>
        <div>Present: <span className="text-blue-600">{summary.present}</span></div>
        <div>Late: <span className="text-primary">{summary.late}</span></div>
        <div>Excused: <span className="text-yellow-600">{summary.excused}</span></div>
        <div>Absent: <span className="text-red-600">{summary.absent}</span></div>
        <div>No School: <span className="text-muted-foreground">{summary.noSchool}</span></div>
        <div>Weekend: <span className="text-green-700">{summary.weekend}</span></div>
      </div>
    </div>
  );
} 