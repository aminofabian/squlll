const fs = require('fs');

// Read the timetable data
const data = JSON.parse(fs.readFileSync('lib/data/mock-timetable-data.json', 'utf8'));
const timetable = data.timetable;

// Create a map to track teacher assignments by time slot
const conflicts = {};
const teacherSchedule = {};

// Analyze each timetable entry
Object.entries(timetable).forEach(([key, lesson]) => {
  if (lesson.isBreak) return; // Skip breaks
  
  const [grade, day, slot] = key.split('-').map(part => 
    part.startsWith('Grade ') ? part : parseInt(part)
  );
  
  const timeSlotKey = `${day}-${slot}`;
  const teacher = lesson.teacher;
  
  if (!teacherSchedule[teacher]) {
    teacherSchedule[teacher] = {};
  }
  
  if (!teacherSchedule[teacher][timeSlotKey]) {
    teacherSchedule[teacher][timeSlotKey] = [];
  }
  
  teacherSchedule[teacher][timeSlotKey].push({
    grade,
    subject: lesson.subject,
    className: lesson.className,
    room: lesson.room,
    students: lesson.studentCount
  });
});

// Find and report conflicts
console.log('=== TEACHER SCHEDULING CONFLICTS ===\n');

Object.entries(teacherSchedule).forEach(([teacher, schedule]) => {
  Object.entries(schedule).forEach(([timeSlot, assignments]) => {
    if (assignments.length > 1) {
      const [day, slot] = timeSlot.split('-');
      const dayNames = ['', 'MON', 'TUE', 'WED', 'THU', 'FRI'];
      const timeSlots = [
        '7:30 AM – 8:15 AM', '8:20 AM – 9:05 AM', '9:10 AM – 9:55 AM',
        '10:00 AM – 10:45 AM', '10:50 AM – 11:35 AM', '11:40 AM – 12:25 PM',
        '12:30 PM – 1:15 PM', '1:20 PM – 2:05 PM', '2:10 PM – 2:55 PM',
        '3:00 PM – 3:45 PM', '3:05 PM – 3:50 PM'
      ];
      
      console.log(`${teacher} has ${assignments.length} conflicting classes:`);
      console.log(`  Time: ${timeSlots[slot]} on ${dayNames[day]}`);
      assignments.forEach(assignment => {
        console.log(`  - ${assignment.grade}: ${assignment.subject} (${assignment.className}, ${assignment.room}, ${assignment.students} students)`);
      });
      console.log('');
    }
  });
});

// Summary statistics
const totalTeachers = Object.keys(teacherSchedule).length;
const conflictedTeachers = Object.values(teacherSchedule).filter(schedule => 
  Object.values(schedule).some(assignments => assignments.length > 1)
).length;

console.log(`\n=== SUMMARY ===`);
console.log(`Total teachers: ${totalTeachers}`);
console.log(`Teachers with conflicts: ${conflictedTeachers}`);
console.log(`Conflict-free teachers: ${totalTeachers - conflictedTeachers}`); 