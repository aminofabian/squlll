"use client";
import React from "react";

// Generate mock attendance data for 1 year (365 days)
const generateMockAttendance = () => {
  const days = 365;
  const today = new Date();
  const data: { date: string; value: number; isWeekend: boolean }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayOfWeek = d.getDay(); // 0 = Sun, 6 = Sat
    let value;
    let isWeekend = false;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      value = 5; // Weekend
      isWeekend = true;
    } else {
      value = Math.random() < 0.8 ? Math.floor(Math.random() * 3) + 1 : 0;
    }
    data.push({ date: d.toISOString().slice(0, 10), value, isWeekend });
  }
  return data;
};

const attendanceData = generateMockAttendance();

const colorScale = [
  "#e5e7eb", // 0 - Absent (gray)
  "#2563eb", // 1 - Present (primary, bold)
  "#60a5fa", // 2 - Late (lighter primary)
  "#fbbf24", // 3 - Excused (yellow)
  "#f3f4f6", // 4 - No School (lightest gray)
  "#d1fae5", // 5 - Weekend (distinct green)
];

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getWeekNumber(date: Date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default function AttendanceHeatmap({
  data = attendanceData,
  startMonth = 0,
  endMonth = 11,
}: {
  data?: { date: string; value: number; isWeekend?: boolean }[];
  startMonth?: number;
  endMonth?: number;
}) {
  // Normalize data to ensure isWeekend is present
  const normalizedData = data.map(d => ({ ...d, isWeekend: d.isWeekend ?? false }));

  // Group data by week
  const weeks: { date: string; value: number; isWeekend: boolean }[][] = [];
  let week: { date: string; value: number; isWeekend: boolean }[] = [];
  normalizedData.forEach((d, i) => {
    week.push(d);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  });
  if (week.length) weeks.push(week);

  // Get month labels for columns
  const monthLabels: { index: number; label: string }[] = [];
  weeks.forEach((w, i) => {
    const firstDay = w[0];
    if (!firstDay) return;
    const month = new Date(firstDay.date).getMonth();
    if (
      (monthLabels.length === 0 && month >= startMonth) ||
      (monthLabels.length > 0 && month !== new Date(monthLabels[monthLabels.length - 1].label + "-01").getMonth())
    ) {
      monthLabels.push({ index: i, label: new Date(firstDay.date).toLocaleString("default", { month: "short" }) });
    }
  });

  // Use normalizedData for summary
  const summary = normalizedData.reduce(
    (acc, d) => {
      if (d.value === 4) acc.noSchool++;
      else if (d.value === 0) acc.absent++;
      else if (d.value === 1) acc.present++;
      else if (d.value === 2) acc.late++;
      else if (d.value === 3) acc.excused++;
      else if (d.value === 5) acc.weekend++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0, noSchool: 0, weekend: 0 }
  );
  const totalSchoolDays = normalizedData.length - summary.noSchool - summary.weekend;

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="font-semibold text-primary">Attendance Activity</span>
        <span className="text-xs text-muted-foreground">(Past Year)</span>
      </div>
      <div className="flex">
        {/* Month labels */}
        <div style={{ width: 32 }}></div>
        <div className="flex gap-1">
          {monthLabels.map((m, i) => (
            <div key={m.index} style={{ width: 16 * 4, textAlign: "center" }} className="text-xs text-muted-foreground">
              {m.label}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        {/* Days of week */}
        <div className="flex flex-col justify-between" style={{ height: 20 * 7, marginTop: 32 }}>
          {daysOfWeek.map((d) => (
            <div key={d} className="text-xs text-muted-foreground font-medium" style={{ height: 20, lineHeight: "20px", width: 24, textAlign: 'right' }}>{d[0]}</div>
          ))}
        </div>
        {/* Heatmap grid, organized by week */}
        <div className="flex gap-4">
          {weeks.map((week, wi) => {
            const weekStart = week[0] ? new Date(week[0].date) : null;
            const weekEnd = week[6] ? new Date(week[6].date) : null;
            const weekNum = weekStart ? getWeekNumber(weekStart) : '';
            const weekBg = wi % 2 === 0 ? 'linear-gradient(180deg, #f8fafc 0%, #f3f4f6 100%)' : '#fff';
            return (
              <div
                key={wi}
                className="flex flex-col items-center"
                style={{
                  border: `2px solid #2563eb`,
                  background: weekBg,
                  minWidth: 36,
                  boxShadow: '0 2px 8px 0 rgba(37,99,235,0.07)',
                  marginBottom: 8,
                  marginTop: 8,
                }}
              >
                {/* Week label */}
                <div className="text-[12px] font-extrabold text-primary mb-0.5 mt-2 text-center tracking-wide" style={{ width: '100%' }}>
                  {weekStart && weekEnd ? `Wk ${weekNum}` : ''}
                </div>
                <div className="text-[10px] text-primary/80 mb-2 text-center font-medium" style={{ width: '100%' }}>
                  {weekStart && weekEnd ? `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
                </div>
                {/* Days in week */}
                <div className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      title={`${day.date}: ${["Absent", "Present", "Late", "Excused", "No School", "Weekend"][day.value]}`}
                      style={{
                        width: 20,
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
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[1], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Present</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[2], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Late</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[3], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Excused</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[0], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> Absent</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[4], display: 'inline-block', border: '1px solid #e5e7eb' }}></span> No School</div>
        <div className="flex items-center gap-1"><span style={{ width: 16, height: 16, background: colorScale[5], display: 'inline-block', border: '2px solid #10b981' }}><span style={{ position: 'absolute', fontSize: 10, color: '#047857', fontWeight: 'bold', lineHeight: '10px' }}>W</span></span> Weekend</div>
      </div>

      {/* Attendance Summary Row */}
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