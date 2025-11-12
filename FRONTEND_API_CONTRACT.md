# 🔌 Frontend-Backend API Contract

## 📋 **For Frontend Team (You)**

This document defines what the **frontend expects** from the backend API. Share this with your backend team.

---

## 🎯 **API Endpoints Needed**

### **Base URL**: `/api/timetable`

---

## 📊 **1. Get Timetable for a Grade**

### **Endpoint**
```
GET /api/timetable/:gradeId?term=:termId
```

### **What Frontend Sends**
```typescript
// Query params
{
  gradeId: string;    // "grade-uuid-123"
  termId?: string;    // Optional: "term-uuid-456"
}
```

### **What Frontend Expects Back**
```typescript
interface TimetableResponse {
  grade: {
    id: string;
    name: string;        // "Grade 7"
    displayName: string; // "F1" (if applicable)
  };
  term: {
    id: string;
    name: string;        // "Term 1"
  };
  timeSlots: TimeSlot[];
  breaks: Break[];
  entries: TimetableEntry[];
}

interface TimeSlot {
  id: string;
  periodNumber: number;
  time: string;           // "8:00 AM - 8:45 AM"
  startTime: string;      // "08:00"
  endTime: string;        // "08:45"
  color: string;          // "border-l-primary" (for UI)
}

interface Break {
  id: string;
  name: string;           // "Morning Break"
  type: string;           // "short_break" | "lunch" | "assembly"
  dayOfWeek: number;      // 1-5 (Monday-Friday)
  afterPeriod: number;    // Break comes after this period
  startTime: string;      // "10:00"
  endTime: string;        // "10:15"
  durationMinutes: number;
  icon?: string;          // "☕" (optional)
  color?: string;         // "bg-orange-500" (optional)
}

interface TimetableEntry {
  id: string;
  dayOfWeek: number;      // 1-5 (Monday-Friday)
  timeSlotId: string;
  subject: {
    id: string;
    name: string;         // "Mathematics"
    code?: string;        // "MATH101"
    color?: string;       // "#3B82F6" (hex color for UI)
  };
  teacher: {
    id: string;
    name: string;         // "John Smith"
    firstName: string;
    lastName: string;
  };
  roomNumber?: string;    // "Room 4"
  isDoublePeriod: boolean;
  notes?: string;
}

// Example Response
{
  "grade": {
    "id": "grade-123",
    "name": "Grade 7",
    "displayName": "F1"
  },
  "term": {
    "id": "term-456",
    "name": "Term 1"
  },
  "timeSlots": [
    {
      "id": "slot-1",
      "periodNumber": 1,
      "time": "8:00 AM - 8:45 AM",
      "startTime": "08:00",
      "endTime": "08:45",
      "color": "border-l-primary"
    }
  ],
  "breaks": [
    {
      "id": "break-1",
      "name": "Morning Break",
      "type": "short_break",
      "dayOfWeek": 1,
      "afterPeriod": 3,
      "startTime": "10:00",
      "endTime": "10:15",
      "durationMinutes": 15
    }
  ],
  "entries": [
    {
      "id": "entry-1",
      "dayOfWeek": 1,
      "timeSlotId": "slot-1",
      "subject": {
        "id": "subj-1",
        "name": "Mathematics",
        "color": "#3B82F6"
      },
      "teacher": {
        "id": "teacher-1",
        "name": "John Smith",
        "firstName": "John",
        "lastName": "Smith"
      },
      "roomNumber": "Room 4",
      "isDoublePeriod": false
    }
  ]
}
```

---

## ✏️ **2. Create Timetable Entry**

### **Endpoint**
```
POST /api/timetable/entries
```

### **What Frontend Sends**
```typescript
interface CreateEntryRequest {
  gradeId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;      // 1-5
  roomNumber?: string;
  isDoublePeriod?: boolean;
  notes?: string;
}

// Example
{
  "gradeId": "grade-123",
  "subjectId": "subj-1",
  "teacherId": "teacher-1",
  "timeSlotId": "slot-1",
  "dayOfWeek": 1,
  "roomNumber": "Room 4"
}
```

### **What Frontend Expects Back**
```typescript
interface CreateEntryResponse {
  success: boolean;
  entry?: TimetableEntry;  // The created entry
  conflicts?: Conflict[];  // If any conflicts detected
  error?: string;
}

interface Conflict {
  type: "teacher_conflict" | "room_conflict" | "grade_conflict";
  message: string;
  affectedEntries: TimetableEntry[];
}

// Success Response
{
  "success": true,
  "entry": { /* TimetableEntry object */ }
}

// Conflict Response (HTTP 409)
{
  "success": false,
  "conflicts": [
    {
      "type": "teacher_conflict",
      "message": "Teacher John Smith is already teaching Grade 8 at this time",
      "affectedEntries": [{ /* existing conflicting entry */ }]
    }
  ]
}
```

---

## 🔄 **3. Update Timetable Entry**

### **Endpoint**
```
PUT /api/timetable/entries/:entryId
```

### **What Frontend Sends**
```typescript
{
  "subjectId": "subj-2",      // Changed subject
  "teacherId": "teacher-2",   // Changed teacher
  "roomNumber": "Room 5"      // Changed room
  // Only send fields that changed
}
```

### **What Frontend Expects Back**
```typescript
{
  "success": true,
  "entry": { /* Updated TimetableEntry */ }
}
```

---

## 🗑️ **4. Delete Timetable Entry**

### **Endpoint**
```
DELETE /api/timetable/entries/:entryId
```

### **What Frontend Expects Back**
```typescript
{
  "success": true,
  "deletedId": "entry-123"
}
```

---

## 👥 **5. Get Teachers**

### **Endpoint**
```
GET /api/teachers?schoolId=:schoolId
```

### **What Frontend Expects Back**
```typescript
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  name: string;           // Full name (computed)
  email?: string;
  subjects: Subject[];    // Subjects this teacher can teach
  color?: string;         // For UI color coding
}

// Example
{
  "teachers": [
    {
      "id": "teacher-1",
      "firstName": "John",
      "lastName": "Smith",
      "name": "John Smith",
      "subjects": [
        { "id": "subj-1", "name": "Mathematics" },
        { "id": "subj-2", "name": "Physics" }
      ],
      "color": "bg-blue-600"
    }
  ]
}
```

---

## 📚 **6. Get Subjects**

### **Endpoint**
```
GET /api/subjects?schoolId=:schoolId
```

### **What Frontend Expects Back**
```typescript
interface Subject {
  id: string;
  name: string;
  code?: string;
  color?: string;         // Hex color for UI
  department?: string;
  isCore: boolean;        // Core vs Elective
}

// Example
{
  "subjects": [
    {
      "id": "subj-1",
      "name": "Mathematics",
      "code": "MATH",
      "color": "#3B82F6",
      "department": "Mathematics",
      "isCore": true
    }
  ]
}
```

---

## 🎓 **7. Get Grades**

### **Endpoint**
```
GET /api/grades?schoolId=:schoolId
```

### **What Frontend Expects Back**
```typescript
interface Grade {
  id: string;
  name: string;           // "Grade 7"
  level: number;          // 7 (for sorting)
  displayName?: string;   // "F1" (optional)
  section?: string;       // "A", "B" (if multiple sections)
}

// Example
{
  "grades": [
    {
      "id": "grade-1",
      "name": "Grade 7",
      "level": 7,
      "displayName": "F1"
    }
  ]
}
```

---

## ⚠️ **8. Detect Conflicts**

### **Endpoint**
```
POST /api/timetable/conflicts/detect
```

### **What Frontend Sends**
```typescript
{
  "termId": "term-123"
}
```

### **What Frontend Expects Back**
```typescript
interface ConflictsResponse {
  totalConflicts: number;
  conflicts: Conflict[];
}

interface Conflict {
  type: "teacher_conflict" | "room_conflict";
  teacher?: {
    id: string;
    name: string;
  };
  room?: string;
  entries: Array<{
    id: string;
    grade: string;
    subject: string;
    dayOfWeek: number;
    timeSlot: string;
  }>;
}

// Example
{
  "totalConflicts": 2,
  "conflicts": [
    {
      "type": "teacher_conflict",
      "teacher": {
        "id": "teacher-1",
        "name": "John Smith"
      },
      "entries": [
        {
          "id": "entry-1",
          "grade": "Grade 7",
          "subject": "Mathematics",
          "dayOfWeek": 1,
          "timeSlot": "8:00 AM - 8:45 AM"
        },
        {
          "id": "entry-2",
          "grade": "Grade 8",
          "subject": "Physics",
          "dayOfWeek": 1,
          "timeSlot": "8:00 AM - 8:45 AM"
        }
      ]
    }
  ]
}
```

---

## 🔍 **9. Search/Filter**

### **Endpoint**
```
GET /api/timetable/search?q=:query&gradeId=:gradeId
```

### **What Frontend Sends**
```typescript
{
  q: string;              // Search term
  gradeId?: string;       // Optional filter
  subjectId?: string;     // Optional filter
  teacherId?: string;     // Optional filter
}
```

### **What Frontend Expects Back**
```typescript
{
  "results": TimetableEntry[]  // Filtered entries
}
```

---

## 📈 **10. Get Statistics** (Optional)

### **Endpoint**
```
GET /api/timetable/:gradeId/statistics
```

### **What Frontend Expects Back**
```typescript
interface Statistics {
  totalLessons: number;
  totalTeachers: number;
  totalSubjects: number;
  completionPercentage: number;
  subjectDistribution: Record<string, number>;
  teacherWorkload: Record<string, number>;
}

// Example
{
  "totalLessons": 50,
  "totalTeachers": 10,
  "totalSubjects": 15,
  "completionPercentage": 85,
  "subjectDistribution": {
    "Mathematics": 8,
    "English": 6
  },
  "teacherWorkload": {
    "John Smith": 15,
    "Mary Johnson": 12
  }
}
```

---

## 🚨 **Error Handling**

All endpoints should follow this error format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // "TEACHER_CONFLICT", "NOT_FOUND", etc.
    message: string;        // Human-readable message
    details?: any;          // Additional error details
  };
}

// HTTP Status Codes
200 - Success
201 - Created
400 - Bad Request (validation error)
404 - Not Found
409 - Conflict (e.g., teacher double-booked)
500 - Server Error
```

---

## 🔄 **Real-time Updates** (Optional but Recommended)

If the backend supports WebSockets/SSE:

### **WebSocket Event**
```typescript
// Frontend listens on: ws://api/timetable/:gradeId/updates

interface TimetableUpdateEvent {
  type: "ENTRY_CREATED" | "ENTRY_UPDATED" | "ENTRY_DELETED";
  entry: TimetableEntry;
  user: {
    id: string;
    name: string;
  };
  timestamp: string;
}

// Example event
{
  "type": "ENTRY_CREATED",
  "entry": { /* TimetableEntry */ },
  "user": {
    "id": "user-1",
    "name": "Admin User"
  },
  "timestamp": "2025-01-13T10:30:00Z"
}
```

---

## 🎨 **For Backend Team: Mock Data Structure**

### **Recommendation for Backend Storage**

Instead of your current flat structure:
```json
{
  "Grade 1-1-3": { "subject": "Break", "teacher": "" }
}
```

Backend should use normalized tables and return data like this:

```json
{
  "timeSlots": [
    { "id": "1", "periodNumber": 1, "startTime": "08:00", "endTime": "08:45" }
  ],
  "breaks": [
    { "id": "b1", "name": "Morning Break", "dayOfWeek": 1, "afterPeriod": 3 }
  ],
  "entries": [
    {
      "id": "e1",
      "gradeId": "grade-1",
      "subjectId": "math-1",
      "teacherId": "teacher-1",
      "timeSlotId": "1",
      "dayOfWeek": 1
    }
  ],
  "subjects": [
    { "id": "math-1", "name": "Mathematics", "color": "#3B82F6" }
  ],
  "teachers": [
    { "id": "teacher-1", "name": "John Smith" }
  ]
}
```

**Key Points for Backend:**
1. ✅ Use UUIDs for all IDs (not composite keys)
2. ✅ Store breaks ONCE (not repeated for each grade)
3. ✅ Use proper foreign key relationships
4. ✅ Return fully hydrated objects (include subject/teacher details)
5. ✅ Validate on the server BEFORE saving (prevent conflicts)

---

## 📋 **Quick Reference for Frontend Team**

### **What You Need from Backend:**

1. ✅ **GET** `/api/timetable/:gradeId` - Get timetable
2. ✅ **POST** `/api/timetable/entries` - Create entry
3. ✅ **PUT** `/api/timetable/entries/:id` - Update entry
4. ✅ **DELETE** `/api/timetable/entries/:id` - Delete entry
5. ✅ **GET** `/api/teachers` - Get all teachers
6. ✅ **GET** `/api/subjects` - Get all subjects
7. ✅ **GET** `/api/grades` - Get all grades
8. ✅ **POST** `/api/timetable/conflicts/detect` - Check conflicts

### **Nice to Have:**
- WebSocket updates for real-time collaboration
- Statistics endpoint
- Search/filter endpoint
- Bulk operations endpoint

---

## 🤝 **Communication with Backend Team**

Share this document with them and request:

1. **API Documentation** - Swagger/OpenAPI spec
2. **TypeScript Types** - Auto-generated from backend
3. **Test Environment** - Staging API URL
4. **Error Codes** - List of all possible error codes
5. **Rate Limits** - Any API rate limiting rules

---

**This is everything the frontend needs from the backend!**

