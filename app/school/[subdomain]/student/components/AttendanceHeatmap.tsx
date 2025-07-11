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
      // More realistic attendance patterns
      const random = Math.random();
      if (random < 0.85) value = 1; // Present (85%)
      else if (random < 0.92) value = 2; // Late (7%)
      else if (random < 0.97) value = 3; // Excused (5%)
      else if (random < 0.99) value = 4; // No School (2%)
      else value = 0; // Absent (1%)
    }
    
    data.push({ date: d.toISOString().slice(0, 10), value, isWeekend });
  }
  return data;
};

const attendanceData = generateMockAttendance();

// Updated color scale with theme colors and better contrast
const colorScale = [
  "#dc2626", // 0 - Absent (red)
  "#16a34a", // 1 - Present (green)
  "#d97706", // 2 - Late (amber)
  "#2563eb", // 3 - Excused (blue)
  "#6b7280", // 4 - No School (gray)
  "#f1f5f9", // 5 - Weekend (light gray)
];

const statusLabels = ["Absent", "Present", "Late", "Excused", "No School", "Weekend"];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

  // Group data by week and pad to start on Sunday
  const weeks: { date: string; value: number; isWeekend: boolean }[][] = [];
  let currentWeek: { date: string; value: number; isWeekend: boolean }[] = [];
  
  normalizedData.forEach((d, i) => {
    const dayOfWeek = new Date(d.date).getDay();
    
    // Start new week on Sunday
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      // Fill remaining days of previous week if needed
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', value: -1, isWeekend: false });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
    
    // Fill empty days at start of first week
    if (currentWeek.length === 0 && dayOfWeek > 0) {
      for (let j = 0; j < dayOfWeek; j++) {
        currentWeek.push({ date: '', value: -1, isWeekend: false });
      }
    }
    
    currentWeek.push(d);
  });
  
  // Add the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', value: -1, isWeekend: false });
    }
    weeks.push(currentWeek);
  }

  // Get month labels
  const monthLabels: { index: number; label: string; month: number }[] = [];
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d.date !== '');
    if (firstValidDay) {
      const month = new Date(firstValidDay.date).getMonth();
      if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].month !== month) {
        monthLabels.push({ 
          index: weekIndex, 
          label: monthNames[month], 
          month 
        });
      }
    }
  });

  // Calculate summary statistics
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
  const attendanceRate = totalSchoolDays > 0 ? ((summary.present + summary.late + summary.excused) / totalSchoolDays * 100).toFixed(1) : '0';

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 p-8 shadow-lg">
      {/* Header with creative design */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-gradient-to-b from-blue-600 to-purple-600"></div>
            <h2 className="text-2xl font-bold text-slate-800">Attendance Overview</h2>
          </div>
          <div className="text-sm text-slate-500 font-medium">Academic Year 2024-2025</div>
        </div>
        
        {/* Creative stats display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Attendance Rate</span>
              <span className={`text-2xl font-bold ${parseFloat(attendanceRate) >= 90 ? 'text-green-600' : parseFloat(attendanceRate) >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                {attendanceRate}%
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-200 h-2">
              <div 
                className={`h-full transition-all duration-500 ${parseFloat(attendanceRate) >= 90 ? 'bg-green-500' : parseFloat(attendanceRate) >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(parseFloat(attendanceRate), 100)}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">School Days</span>
              <span className="text-2xl font-bold text-slate-800">{totalSchoolDays}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Total academic days</div>
          </div>
          
          <div className="bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Present Days</span>
              <span className="text-2xl font-bold text-green-600">{summary.present}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">Perfect attendance</div>
          </div>
        </div>
      </div>

      {/* Month Labels with creative styling */}
      <div className="flex mb-4">
        <div className="w-16"></div>
        <div className="flex-1 flex">
          {monthLabels.map((month, i) => (
            <div 
              key={month.index} 
              className="text-sm font-semibold text-slate-700 text-center relative"
              style={{ 
                width: `${100 / monthLabels.length}%`,
                minWidth: '80px'
              }}
            >
              <div className="bg-white px-3 py-1 border border-slate-200 shadow-sm">
                {month.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Container with creative design */}
      <div className="bg-white border-2 border-slate-300 p-6 shadow-lg">
        <div className="flex">
          {/* Day Labels with creative styling */}
          <div className="flex flex-col mr-4">
            {daysOfWeek.map((day, i) => (
              <div key={day} className="h-6 flex items-center text-sm font-semibold text-slate-600 mb-1" style={{ width: '48px' }}>
                {i % 2 === 1 ? (
                  <div className="bg-slate-100 px-2 py-1 border border-slate-200 text-center w-full">
                    {day}
                  </div>
                ) : ''}
              </div>
            ))}
          </div>

          {/* Heatmap Grid with enhanced styling */}
          <div className="flex-1 overflow-x-auto">
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className="w-5 h-5 border border-slate-300 hover:border-slate-400 hover:scale-110 transition-all duration-200 cursor-pointer shadow-sm"
                      style={{
                        backgroundColor: day.date === '' ? 'transparent' : colorScale[day.value],
                        opacity: day.date === '' ? 0 : 1,
                        borderColor: day.date === '' ? 'transparent' : undefined,
                        boxShadow: day.date !== '' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                      }}
                      title={day.date ? `${new Date(day.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}: ${statusLabels[day.value]}` : ''}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Legend with creative design */}
      <div className="mt-6 bg-white border border-slate-200 p-4 shadow-sm">
        <div className="text-sm font-semibold text-slate-700 mb-3">Attendance Legend</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[1] }}></div>
            <span className="text-slate-700 font-medium">Present</span>
            <span className="text-slate-500 text-xs">({summary.present})</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[2] }}></div>
            <span className="text-slate-700 font-medium">Late</span>
            <span className="text-slate-500 text-xs">({summary.late})</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[3] }}></div>
            <span className="text-slate-700 font-medium">Excused</span>
            <span className="text-slate-500 text-xs">({summary.excused})</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[0] }}></div>
            <span className="text-slate-700 font-medium">Absent</span>
            <span className="text-slate-500 text-xs">({summary.absent})</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[4] }}></div>
            <span className="text-slate-700 font-medium">No School</span>
            <span className="text-slate-500 text-xs">({summary.noSchool})</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200">
            <div className="w-4 h-4 border border-slate-300 shadow-sm" style={{ backgroundColor: colorScale[5] }}></div>
            <span className="text-slate-700 font-medium">Weekend</span>
            <span className="text-slate-500 text-xs">({summary.weekend})</span>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Statistics with creative cards */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-green-700 mb-1">{summary.present}</div>
          <div className="text-sm text-green-600 font-medium">Days Present</div>
          <div className="text-xs text-green-500 mt-1">Perfect attendance</div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-amber-700 mb-1">{summary.late}</div>
          <div className="text-sm text-amber-600 font-medium">Days Late</div>
          <div className="text-xs text-amber-500 mt-1">Tardy arrivals</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-red-700 mb-1">{summary.absent}</div>
          <div className="text-sm text-red-600 font-medium">Days Absent</div>
          <div className="text-xs text-red-500 mt-1">Unexcused absences</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 text-center shadow-sm">
          <div className="text-3xl font-bold text-blue-700 mb-1">{summary.excused}</div>
          <div className="text-sm text-blue-600 font-medium">Excused Absences</div>
          <div className="text-xs text-blue-500 mt-1">Documented reasons</div>
        </div>
      </div>
    </div>
  );
}