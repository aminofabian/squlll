const fs = require('fs');

// Read the original data
const data = JSON.parse(fs.readFileSync('lib/data/mock-timetable-data.json', 'utf8'));
const originalTimetable = data.timetable;
const metadata = data.metadata;

// Define the structure
const grades = [1, 2, 3, 4];
const days = [1, 2, 3, 4, 5]; // Mon-Fri
const timeSlots = [0, 1, 2, 5, 6, 7, 9, 10]; // Excluding breaks at 3, 4, 8
const breakSlots = [3, 4, 8]; // Morning break, afternoon break, lunch

// Initialize new timetable with breaks
const newTimetable = {};

// Add breaks for all grades and days
grades.forEach(grade => {
  days.forEach(day => {
    breakSlots.forEach(slot => {
      const key = `Grade ${grade}-${day}-${slot}`;
      if (slot === 8) {
        newTimetable[key] = { "subject": "Lunch", "teacher": "", "isBreak": true, "breakType": "lunch" };
      } else {
        newTimetable[key] = { "subject": "Break", "teacher": "", "isBreak": true, "breakType": "break" };
      }
    });
  });
});

// Subject distribution - spread across days and time slots to avoid conflicts
const subjectSchedule = {
  1: { // Grade 1
    1: { // Monday
      0: { subject: "Mathematics", teacher: "John Smith", className: "1A", room: "Room 4", studentCount: 42 },
      1: { subject: "Mandarin", teacher: "Li Wei", className: "1A", room: "Room 21", studentCount: 38 },
      2: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3B", room: "Room 3", studentCount: 40 },
      5: { subject: "Italian", teacher: "Isabella Rossi", className: "1A", room: "Room 22", studentCount: 38 },
      6: { subject: "Mathematics", teacher: "John Smith", className: "1C", room: "Room 20", studentCount: 41 },
      7: { subject: "Calculus", teacher: "Emma Thompson", className: "3B", room: "Room 10", studentCount: 42 },
      9: { subject: "Italian", teacher: "Isabella Rossi", className: "1B", room: "Room 22", studentCount: 39 },
      10: { subject: "Mathematics", teacher: "John Smith", className: "1C", room: "Room 4", studentCount: 42 }
    },
    2: { // Tuesday
      0: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3B", room: "Room 14", studentCount: 40 },
      1: { subject: "Mandarin", teacher: "Li Wei", className: "1B", room: "Room 21", studentCount: 39 },
      2: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 15", studentCount: 39 },
      5: { subject: "Italian", teacher: "Isabella Rossi", className: "1C", room: "Room 22", studentCount: 40 },
      6: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 1", studentCount: 42 },
      7: { subject: "Italian", teacher: "Isabella Rossi", className: "1A", room: "Room 22", studentCount: 38 },
      9: { subject: "Mathematics", teacher: "John Smith", className: "1C", room: "Room 19", studentCount: 39 },
      10: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4C", room: "Room 8", studentCount: 37 }
    },
    3: { // Wednesday 
      0: { subject: "Mandarin", teacher: "Li Wei", className: "1C", room: "Room 21", studentCount: 40 },
      1: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 6", studentCount: 42 },
      2: { subject: "Mathematics", teacher: "John Smith", className: "1A", room: "Room 16", studentCount: 40 },
      5: { subject: "Mandarin", teacher: "Li Wei", className: "1A", room: "Room 21", studentCount: 38 },
      6: { subject: "Italian", teacher: "Isabella Rossi", className: "1B", room: "Room 22", studentCount: 39 },
      7: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 18", studentCount: 41 },
      9: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4A", room: "Room 18", studentCount: 40 },
      10: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3A", room: "Room 3", studentCount: 41 }
    },
    4: { // Thursday
      0: { subject: "Mandarin", teacher: "Li Wei", className: "1B", room: "Room 21", studentCount: 39 },
      1: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 17", studentCount: 36 },
      2: { subject: "Italian", teacher: "Isabella Rossi", className: "1C", room: "Room 22", studentCount: 40 },
      5: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 12", studentCount: 40 },
      6: { subject: "Italian", teacher: "Isabella Rossi", className: "1A", room: "Room 22", studentCount: 38 },
      7: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 1", studentCount: 40 },
      9: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3B", room: "Room 4", studentCount: 41 },
      10: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4C", room: "Room 5", studentCount: 35 }
    },
    5: { // Friday
      0: { subject: "Mandarin", teacher: "Li Wei", className: "1C", room: "Room 21", studentCount: 40 },
      1: { subject: "Mandarin", teacher: "Li Wei", className: "1A", room: "Room 21", studentCount: 38 },
      2: { subject: "Mandarin", teacher: "Li Wei", className: "1B", room: "Room 21", studentCount: 39 },
      5: { subject: "Mathematics", teacher: "John Smith", className: "1C", room: "Room 8", studentCount: 38 },
      6: { subject: "Italian", teacher: "Isabella Rossi", className: "1B", room: "Room 22", studentCount: 39 },
      7: { subject: "Mathematics", teacher: "John Smith", className: "1B", room: "Room 3", studentCount: 0 },
      9: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4B", room: "Room 14", studentCount: 42 },
      10: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3C", room: "Room 5", studentCount: 44 }
    }
  },
  2: { // Grade 2
    1: { // Monday
      0: { subject: "Literature", teacher: "James Wilson", className: "2B", room: "Room 7", studentCount: 35 },
      1: { subject: "Chemistry", teacher: "Jennifer Lee", className: "2C", room: "Room 9", studentCount: 32 },
      2: { subject: "Advanced Art", teacher: "Amanda Rodriguez", className: "2A", room: "Room 12", studentCount: 28 },
      5: { subject: "Physical Education", teacher: "Alex Johnson", className: "2B", room: "Gym", studentCount: 30 },
      6: { subject: "Italian", teacher: "Isabella Rossi", className: "2A", room: "Room 22", studentCount: 35 },
      7: { subject: "Portuguese", teacher: "Maria Santos", className: "2A", room: "Room 15", studentCount: 22 },
      9: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "2B", room: "Room 18", studentCount: 29 },
      10: { subject: "Advanced Music", teacher: "Michael Davis", className: "2C", room: "Music Room", studentCount: 24 }
    },
    2: { // Tuesday
      0: { subject: "Advanced Mathematics", teacher: "Emma Thompson", className: "2A", room: "Room 5", studentCount: 38 },
      1: { subject: "Physical Education", teacher: "Alex Johnson", className: "2C", room: "Gym", studentCount: 30 },
      2: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "2A", room: "Room 18", studentCount: 29 },
      5: { subject: "Programming", teacher: "Sophie Dubois", className: "2B", room: "Lab 1", studentCount: 25 },
      6: { subject: "Italian", teacher: "Isabella Rossi", className: "2B", room: "Room 22", studentCount: 35 },
      7: { subject: "Portuguese", teacher: "Maria Santos", className: "2A", room: "Room 15", studentCount: 22 },
      9: { subject: "World History", teacher: "Carlos Martinez", className: "2B", room: "Room 20", studentCount: 31 },
      10: { subject: "Advanced Art", teacher: "Amanda Rodriguez", className: "2C", room: "Room 12", studentCount: 28 }
    },
    3: { // Wednesday
      0: { subject: "Literature", teacher: "James Wilson", className: "2A", room: "Room 7", studentCount: 35 },
      1: { subject: "Advanced Mathematics", teacher: "Emma Thompson", className: "2B", room: "Room 5", studentCount: 38 },
      2: { subject: "Physical Education", teacher: "Alex Johnson", className: "2A", room: "Gym", studentCount: 30 },
      5: { subject: "Advanced Art", teacher: "Amanda Rodriguez", className: "2B", room: "Room 12", studentCount: 28 },
      6: { subject: "Portuguese", teacher: "Maria Santos", className: "2A", room: "Room 15", studentCount: 22 },
      7: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "2B", room: "Room 18", studentCount: 29 },
      9: { subject: "Advanced Music", teacher: "Michael Davis", className: "2C", room: "Music Room", studentCount: 24 },
      10: { subject: "Chemistry", teacher: "Jennifer Lee", className: "2A", room: "Room 9", studentCount: 32 }
    },
    4: { // Thursday
      0: { subject: "World History", teacher: "Carlos Martinez", className: "2A", room: "Room 20", studentCount: 31 },
      1: { subject: "Literature", teacher: "James Wilson", className: "2B", room: "Room 7", studentCount: 35 },
      2: { subject: "Chemistry", teacher: "Jennifer Lee", className: "2A", room: "Room 9", studentCount: 32 },
      5: { subject: "Physical Education", teacher: "Alex Johnson", className: "2B", room: "Gym", studentCount: 30 },
      6: { subject: "Portuguese", teacher: "Maria Santos", className: "2A", room: "Room 15", studentCount: 22 },
      7: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "2B", room: "Room 18", studentCount: 29 },
      9: { subject: "Advanced Music", teacher: "Michael Davis", className: "2C", room: "Music Room", studentCount: 24 },
      10: { subject: "Advanced Mathematics", teacher: "Emma Thompson", className: "2C", room: "Room 5", studentCount: 38 }
    },
    5: { // Friday
      0: { subject: "Physical Education", teacher: "Alex Johnson", className: "2A", room: "Gym", studentCount: 30 },
      1: { subject: "Advanced Music", teacher: "Michael Davis", className: "2B", room: "Music Room", studentCount: 24 },
      2: { subject: "Advanced Art", teacher: "Amanda Rodriguez", className: "2A", room: "Room 12", studentCount: 28 },
      5: { subject: "Literature", teacher: "James Wilson", className: "2C", room: "Room 7", studentCount: 35 },
      6: { subject: "Portuguese", teacher: "Maria Santos", className: "2A", room: "Room 15", studentCount: 22 },
      7: { subject: "World History", teacher: "Carlos Martinez", className: "2B", room: "Room 20", studentCount: 31 },
      9: { subject: "Chemistry", teacher: "Jennifer Lee", className: "2C", room: "Room 9", studentCount: 32 },
      10: { subject: "Italian", teacher: "Isabella Rossi", className: "2B", room: "Room 22", studentCount: 35 }
    }
  },
  3: { // Grade 3
    1: { // Monday
      0: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3B", room: "Room 8", studentCount: 28 },
      1: { subject: "Physics", teacher: "David Brown", className: "3C", room: "Room 12", studentCount: 32 },
      2: { subject: "Digital Art", teacher: "Michael Davis", className: "3A", room: "Art Studio", studentCount: 25 },
      5: { subject: "Sports Science", teacher: "Lisa Anderson", className: "3B", room: "Gym", studentCount: 30 },
      6: { subject: "Arabic", teacher: "Patricia Ochieng", className: "3A", room: "Room 15", studentCount: 20 },
      7: { subject: "Modern History", teacher: "Sarah Wilson", className: "3B", room: "Room 18", studentCount: 29 },
      9: { subject: "Orchestra", teacher: "Amanda Rodriguez", className: "3C", room: "Music Room", studentCount: 18 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "3A", room: "Room 22", studentCount: 25 }
    },
    2: { // Tuesday
      0: { subject: "Calculus", teacher: "Emma Thompson", className: "3B", room: "Room 10", studentCount: 35 },
      1: { subject: "Sports Science", teacher: "Lisa Anderson", className: "3C", room: "Gym", studentCount: 30 },
      2: { subject: "Modern History", teacher: "Sarah Wilson", className: "3A", room: "Room 18", studentCount: 29 },
      5: { subject: "Physics", teacher: "David Brown", className: "3C", room: "Room 12", studentCount: 32 },
      6: { subject: "Arabic", teacher: "Patricia Ochieng", className: "3A", room: "Room 15", studentCount: 20 },
      7: { subject: "World History", teacher: "Carlos Martinez", className: "3B", room: "Room 20", studentCount: 31 },
      9: { subject: "Digital Art", teacher: "Michael Davis", className: "3C", room: "Art Studio", studentCount: 25 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "3B", room: "Room 22", studentCount: 22 }
    },
    3: { // Wednesday
      0: { subject: "Physics", teacher: "David Brown", className: "3A", room: "Room 12", studentCount: 32 },
      1: { subject: "Calculus", teacher: "Emma Thompson", className: "3B", room: "Room 10", studentCount: 35 },
      2: { subject: "Sports Science", teacher: "Lisa Anderson", className: "3A", room: "Gym", studentCount: 30 },
      5: { subject: "Digital Art", teacher: "Michael Davis", className: "3B", room: "Art Studio", studentCount: 25 },
      6: { subject: "Arabic", teacher: "Patricia Ochieng", className: "3A", room: "Room 15", studentCount: 20 },
      7: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "3B", room: "Room 18", studentCount: 29 },
      9: { subject: "Orchestra", teacher: "Amanda Rodriguez", className: "3C", room: "Music Room", studentCount: 18 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "3C", room: "Room 22", studentCount: 29 }
    },
    4: { // Thursday
      0: { subject: "Modern History", teacher: "Sarah Wilson", className: "3A", room: "Room 18", studentCount: 29 },
      1: { subject: "Calculus", teacher: "Emma Thompson", className: "3C", room: "Room 10", studentCount: 35 },
      2: { subject: "Physics", teacher: "David Brown", className: "3A", room: "Room 12", studentCount: 32 },
      5: { subject: "Sports Science", teacher: "Lisa Anderson", className: "3B", room: "Gym", studentCount: 30 },
      6: { subject: "Web Development", teacher: "Robert Chen", className: "3C", room: "Lab 2", studentCount: 22 },
      7: { subject: "Arabic", teacher: "Patricia Ochieng", className: "3A", room: "Room 15", studentCount: 20 },
      9: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "3B", room: "Room 18", studentCount: 29 },
      10: { subject: "Digital Art", teacher: "Michael Davis", className: "3C", room: "Art Studio", studentCount: 25 }
    },
    5: { // Friday
      0: { subject: "Sports Science", teacher: "Lisa Anderson", className: "3A", room: "Gym", studentCount: 30 },
      1: { subject: "Orchestra", teacher: "Amanda Rodriguez", className: "3B", room: "Music Room", studentCount: 18 },
      2: { subject: "Digital Art", teacher: "Michael Davis", className: "3A", room: "Art Studio", studentCount: 25 },
      5: { subject: "Advanced Literature", teacher: "Mary Johnson", className: "3C", room: "Room 8", studentCount: 28 },
      6: { subject: "Arabic", teacher: "Patricia Ochieng", className: "3A", room: "Room 15", studentCount: 20 },
      7: { subject: "World History", teacher: "Carlos Martinez", className: "3B", room: "Room 20", studentCount: 31 },
      9: { subject: "Physics", teacher: "David Brown", className: "3C", room: "Room 12", studentCount: 32 },
      10: { subject: "Calculus", teacher: "Emma Thompson", className: "3B", room: "Room 10", studentCount: 35 }
    }
  },
  4: { // Grade 4
    1: { // Monday
      0: { subject: "World Literature", teacher: "James Wilson", className: "4B", room: "Room 13", studentCount: 26 },
      1: { subject: "Advanced Physics", teacher: "Jennifer Lee", className: "4C", room: "Room 14", studentCount: 30 },
      2: { subject: "Studio Art", teacher: "Amanda Rodriguez", className: "4A", room: "Art Studio", studentCount: 22 },
      5: { subject: "Advanced Sports Science", teacher: "Alex Johnson", className: "4B", room: "Gym", studentCount: 28 },
      6: { subject: "Japanese", teacher: "Maria Santos", className: "4A", room: "Room 16", studentCount: 18 },
      7: { subject: "Contemporary History", teacher: "Carlos Martinez", className: "4B", room: "Room 19", studentCount: 27 },
      9: { subject: "Band", teacher: "Michael Davis", className: "4C", room: "Music Room", studentCount: 16 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "4A", room: "Room 22", studentCount: 20 }
    },
    2: { // Tuesday
      0: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4B", room: "Room 11", studentCount: 43 },
      1: { subject: "Advanced Sports Science", teacher: "Alex Johnson", className: "4C", room: "Gym", studentCount: 28 },
      2: { subject: "Contemporary History", teacher: "Carlos Martinez", className: "4A", room: "Room 19", studentCount: 27 },
      5: { subject: "Advanced Physics", teacher: "Jennifer Lee", className: "4C", room: "Room 14", studentCount: 30 },
      6: { subject: "Japanese", teacher: "Maria Santos", className: "4A", room: "Room 16", studentCount: 18 },
      7: { subject: "World History", teacher: "Thomas Garcia", className: "4B", room: "Room 20", studentCount: 31 },
      9: { subject: "Studio Art", teacher: "Amanda Rodriguez", className: "4C", room: "Art Studio", studentCount: 22 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "4B", room: "Room 22", studentCount: 18 }
    },
    3: { // Wednesday
      0: { subject: "Advanced Physics", teacher: "Jennifer Lee", className: "4A", room: "Room 14", studentCount: 30 },
      1: { subject: "World Literature", teacher: "James Wilson", className: "4C", room: "Room 13", studentCount: 26 },
      2: { subject: "Advanced Sports Science", teacher: "Alex Johnson", className: "4A", room: "Gym", studentCount: 28 },
      5: { subject: "Studio Art", teacher: "Amanda Rodriguez", className: "4B", room: "Art Studio", studentCount: 22 },
      6: { subject: "Japanese", teacher: "Maria Santos", className: "4A", room: "Room 16", studentCount: 18 },
      7: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "4B", room: "Room 18", studentCount: 29 },
      9: { subject: "Band", teacher: "Michael Davis", className: "4C", room: "Music Room", studentCount: 16 },
      10: { subject: "Classical Literature", teacher: "Isabella Rossi", className: "4C", room: "Room 22", studentCount: 16 }
    },
    4: { // Thursday
      0: { subject: "Contemporary History", teacher: "Carlos Martinez", className: "4A", room: "Room 19", studentCount: 27 },
      1: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4C", room: "Room 11", studentCount: 43 },
      2: { subject: "Advanced Physics", teacher: "Jennifer Lee", className: "4A", room: "Room 14", studentCount: 30 },
      5: { subject: "Advanced Sports Science", teacher: "Alex Johnson", className: "4B", room: "Gym", studentCount: 28 },
      6: { subject: "Advanced Programming", teacher: "Sophie Dubois", className: "4C", room: "Lab 3", studentCount: 20 },
      7: { subject: "Japanese", teacher: "Maria Santos", className: "4A", room: "Room 16", studentCount: 18 },
      9: { subject: "Environmental Science", teacher: "Thomas Garcia", className: "4B", room: "Room 18", studentCount: 29 },
      10: { subject: "Studio Art", teacher: "Amanda Rodriguez", className: "4C", room: "Art Studio", studentCount: 22 }
    },
    5: { // Friday
      0: { subject: "Advanced Sports Science", teacher: "Alex Johnson", className: "4A", room: "Gym", studentCount: 28 },
      1: { subject: "Band", teacher: "Michael Davis", className: "4B", room: "Music Room", studentCount: 16 },
      2: { subject: "Studio Art", teacher: "Amanda Rodriguez", className: "4A", room: "Art Studio", studentCount: 22 },
      5: { subject: "World Literature", teacher: "James Wilson", className: "4C", room: "Room 13", studentCount: 26 },
      6: { subject: "Japanese", teacher: "Maria Santos", className: "4A", room: "Room 16", studentCount: 18 },
      7: { subject: "World History", teacher: "Thomas Garcia", className: "4B", room: "Room 20", studentCount: 31 },
      9: { subject: "Advanced Physics", teacher: "Jennifer Lee", className: "4C", room: "Room 14", studentCount: 30 },
      10: { subject: "Advanced Calculus", teacher: "Emma Thompson", className: "4B", room: "Room 11", studentCount: 43 }
    }
  }
};

// Build the new timetable from the subject schedule
grades.forEach(grade => {
  days.forEach(day => {
    timeSlots.forEach(slot => {
      const key = `Grade ${grade}-${day}-${slot}`;
      if (subjectSchedule[grade] && subjectSchedule[grade][day] && subjectSchedule[grade][day][slot]) {
        newTimetable[key] = subjectSchedule[grade][day][slot];
      }
    });
  });
});

// Create the new data object
const newData = {
  timetable: newTimetable,
  metadata: metadata
};

// Save the fixed timetable
fs.writeFileSync('lib/data/mock-timetable-data-fixed.json', JSON.stringify(newData, null, 2));

console.log('✅ Fixed timetable saved to lib/data/mock-timetable-data-fixed.json');
console.log('📊 Total lessons scheduled:', Object.keys(newTimetable).filter(key => !newTimetable[key].isBreak).length);
console.log('🔄 Running conflict analysis on fixed timetable...\n');

// Re-run conflict analysis on the fixed data
const teacherScheduleFixed = {};

Object.entries(newTimetable).forEach(([key, lesson]) => {
  if (lesson.isBreak) return;
  
  const [grade, day, slot] = key.split('-').map(part => 
    part.startsWith('Grade ') ? part : parseInt(part)
  );
  
  const timeSlotKey = `${day}-${slot}`;
  const teacher = lesson.teacher;
  
  if (!teacherScheduleFixed[teacher]) {
    teacherScheduleFixed[teacher] = {};
  }
  
  if (!teacherScheduleFixed[teacher][timeSlotKey]) {
    teacherScheduleFixed[teacher][timeSlotKey] = [];
  }
  
  teacherScheduleFixed[teacher][timeSlotKey].push({
    grade,
    subject: lesson.subject,
    className: lesson.className
  });
});

// Check for remaining conflicts
let hasConflicts = false;
Object.entries(teacherScheduleFixed).forEach(([teacher, schedule]) => {
  Object.entries(schedule).forEach(([timeSlot, assignments]) => {
    if (assignments.length > 1) {
      hasConflicts = true;
      console.log(`❌ ${teacher} still has ${assignments.length} conflicts at time ${timeSlot}`);
    }
  });
});

if (!hasConflicts) {
  console.log('✅ No conflicts found in the fixed timetable!');
  console.log('🎉 All teachers now have non-overlapping schedules.');
} 