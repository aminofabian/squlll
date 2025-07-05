# Teacher Timetable JSON Structure

The teacher timetable uses the same JSON structure as the main timetable but adapted for teacher-specific data. This allows for seamless data exchange and compatibility between different timetable views.

## JSON Structure

```json
{
  "timetable": {
    "DAY-PERIODINDEX": {
      "subject": "string",
      "room": "string", 
      "class": "string",
      "grade": "string",
      "stream": "string",
      "day": "string",
      "period": "number",
      "totalStudents": "number",
      "completed": "boolean"
    }
  },
  "metadata": {
    "teacherName": "string",
    "timeSlots": ["string"],
    "breaks": {
      "Monday": [{"start": "string", "end": "string", "period": "number"}],
      "Tuesday": [{"start": "string", "end": "string", "period": "number"}],
      "Wednesday": [{"start": "string", "end": "string", "period": "number"}],
      "Thursday": [{"start": "string", "end": "string", "period": "number"}],
      "Friday": [{"start": "string", "end": "string", "period": "number"}]
    },
    "lunch": {
      "Monday": [{"start": "string", "end": "string", "period": "number"}],
      "Tuesday": [{"start": "string", "end": "string", "period": "number"}],
      "Wednesday": [{"start": "string", "end": "string", "period": "number"}],
      "Thursday": [{"start": "string", "end": "string", "period": "number"}],
      "Friday": [{"start": "string", "end": "string", "period": "number"}]
    },
    "stats": {
      "totalClasses": "number",
      "gradeDistribution": {
        "Grade 6": "number",
        "Grade 7": "number",
        "Grade 8": "number"
      },
      "totalStudents": "number",
      "classesPerDay": {
        "MONDAY": "number",
        "TUESDAY": "number",
        "WEDNESDAY": "number",
        "THURSDAY": "number",
        "FRIDAY": "number"
      }
    },
    "lastSaved": "string (ISO date)"
  }
}
```

## Key Differences from Main Timetable

### 1. Cell Key Format
- **Main Timetable**: `grade-timeId-dayIndex` (e.g., "Grade 7-1-0")
- **Teacher Timetable**: `day-periodIndex` (e.g., "MONDAY-0")

### 2. Lesson Data Structure
- **Main Timetable**: Focuses on subject, teacher, and break information
- **Teacher Timetable**: Focuses on room, class, grade, stream, and student count

### 3. Metadata
- **Main Timetable**: Includes grade-specific information
- **Teacher Timetable**: Includes teacher-specific information and statistics

## Example Usage

### Saving a Teacher Timetable
```javascript
// The save function automatically converts the internal schedule format
// to the JSON structure above
handleSaveTimetable();
```

### Loading a Teacher Timetable
```javascript
// The load function automatically converts the JSON structure
// back to the internal schedule format
handleLoadTimetable();
```

### Sample JSON File
Click the "Sample JSON" button in the teacher timetable interface to download a sample file that demonstrates the complete structure.

## Compatibility

The teacher timetable JSON structure is designed to be:
- **Backward Compatible**: Can load data from main timetable exports (with conversion)
- **Forward Compatible**: Can export data that can be used by main timetable (with conversion)
- **Self-Contained**: Contains all necessary information for teacher-specific functionality

## Data Conversion

When loading data from a main timetable JSON:
1. Grade-based cell keys are converted to day-period format
2. Teacher information is extracted and used for lesson details
3. Subject information is preserved
4. Break information is maintained

When saving data for use in main timetable:
1. Day-period keys are converted to grade-time-day format
2. Teacher information is preserved
3. Subject and break information is maintained
4. Metadata is adapted for grade-specific context 