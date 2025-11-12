# 🎯 Recommendations for Backend Team (NestJS)

## 📨 **From Frontend Team: What We Need**

This document contains our recommendations for the backend API. We've already optimized the frontend - now we need the backend to match!

---

## 🚨 **Critical Issue with Current Mock Data**

### **Current Structure (❌ Not Efficient)**

```json
{
  "timetable": {
    "Grade 1-1-3": { "subject": "Break", "teacher": "" },
    "Grade 1-2-3": { "subject": "Break", "teacher": "" },
    "Grade 1-3-3": { "subject": "Break", "teacher": "" },
    "Grade 1-4-3": { "subject": "Break", "teacher": "" },
    "Grade 1-5-3": { "subject": "Break", "teacher": "" },
    // Repeated 75 times for all grades and days! ❌
  }
}
```

**Problems:**
- 1,822 lines with 90% duplication
- Breaks stored separately for each grade/day
- Composite keys ("Grade 1-1-3") are hard to query
- No referential integrity

---

## ✅ **Recommended API Response Format**

### **What Frontend Expects:**

```json
{
  "grade": {
    "id": "uuid-123",
    "name": "Grade 7",
    "displayName": "F1"
  },
  "term": {
    "id": "uuid-456",
    "name": "Term 1"
  },
  "timeSlots": [
    {
      "id": "uuid-slot-1",
      "periodNumber": 1,
      "time": "8:00 AM - 8:45 AM",
      "startTime": "08:00",
      "endTime": "08:45",
      "color": "border-l-primary"
    }
  ],
  "breaks": [
    {
      "id": "uuid-break-1",
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
      "id": "uuid-entry-1",
      "dayOfWeek": 1,
      "timeSlotId": "uuid-slot-1",
      "subject": {
        "id": "uuid-subject-1",
        "name": "Mathematics",
        "color": "#3B82F6"
      },
      "teacher": {
        "id": "uuid-teacher-1",
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

## 🗄️ **Recommended Database Structure**

### **Key Tables Needed:**

```
schools
  ├─ grades
  ├─ subjects
  ├─ teachers
  ├─ time_slots
  ├─ breaks (stored ONCE, not per grade!)
  └─ timetable_entries (the actual schedule)
```

### **Why This is Better:**

1. **Breaks stored once**: One row for "Morning Break on Monday after Period 3"
   - Current: 15 rows (one per grade)
   - Optimized: 1 row

2. **Proper relationships**: Foreign keys prevent orphaned data

3. **Easy to query**: 
   ```sql
   SELECT * FROM timetable_entries 
   WHERE grade_id = '...' AND day_of_week = 1
   ORDER BY time_slot.period_number
   ```

4. **Scales infinitely**: Adding new grades doesn't multiply data

---

## 📊 **Data Reduction Example**

### **Current Mock Data:**
- Total entries: ~1,500
- File size: 150KB
- Breaks: 75 entries (5 days × 15 grades)
- Redundancy: 90%

### **With Proper Database:**
- Total entries: ~750 (only actual lessons)
- Breaks: 15 entries (5 days × 3 break types)
- Redundancy: 0%
- **Reduction: 60% smaller**

---

## 🎯 **Required Endpoints**

See **FRONTEND_API_CONTRACT.md** for full details.

### **Minimum Required:**

1. `GET /api/timetable/:gradeId` - Get timetable
2. `POST /api/timetable/entries` - Create entry (with conflict validation!)
3. `PUT /api/timetable/entries/:id` - Update entry
4. `DELETE /api/timetable/entries/:id` - Delete entry
5. `GET /api/teachers` - List teachers
6. `GET /api/subjects` - List subjects
7. `GET /api/grades` - List grades
8. `POST /api/timetable/conflicts/detect` - Validate conflicts

---

## ⚠️ **Critical: Server-Side Validation**

### **Before saving, check:**

1. ✅ Teacher not double-booked
2. ✅ Room not double-booked
3. ✅ Grade not double-booked
4. ✅ Teacher teaches this subject
5. ✅ Valid time slot and day

### **Example NestJS Service:**

```typescript
@Injectable()
export class TimetableService {
  async create(dto: CreateTimetableEntryDto) {
    // 1. Check teacher availability
    const conflict = await this.prisma.timetableEntry.findFirst({
      where: {
        teacherId: dto.teacherId,
        dayOfWeek: dto.dayOfWeek,
        timeSlotId: dto.timeSlotId,
        NOT: { id: dto.id }
      }
    });

    if (conflict) {
      throw new ConflictException('Teacher is already booked');
    }

    // 2. Save
    return this.prisma.timetableEntry.create({ data: dto });
  }
}
```

---

## 🔍 **Return Populated Objects**

Frontend needs **full objects**, not just IDs.

### **❌ Bad Response:**
```json
{
  "id": "entry-1",
  "subjectId": "subj-123",
  "teacherId": "teacher-456"
}
```

### **✅ Good Response:**
```json
{
  "id": "entry-1",
  "subject": {
    "id": "subj-123",
    "name": "Mathematics",
    "color": "#3B82F6"
  },
  "teacher": {
    "id": "teacher-456",
    "name": "John Smith"
  }
}
```

### **In Prisma:**
```typescript
return this.prisma.timetableEntry.findMany({
  include: {
    subject: true,
    teacher: true,
    timeSlot: true
  }
});
```

---

## 🚀 **Performance Tips**

### **1. Use Proper Indexes**

```sql
CREATE INDEX idx_timetable_grade ON timetable_entries(grade_id, day_of_week);
CREATE INDEX idx_timetable_teacher ON timetable_entries(teacher_id, day_of_week);
CREATE UNIQUE INDEX idx_prevent_conflicts 
  ON timetable_entries(teacher_id, day_of_week, time_slot_id);
```

### **2. Cache Responses**

```typescript
@Get(':gradeId')
@UseInterceptors(CacheInterceptor)
@CacheTTL(300) // 5 minutes
async getTimetable(@Param('gradeId') gradeId: string) {
  return this.service.getTimetable(gradeId);
}
```

### **3. Optimize Queries**

```typescript
// ❌ N+1 Query Problem
const entries = await this.prisma.timetableEntry.findMany();
for (const entry of entries) {
  entry.subject = await this.prisma.subject.findUnique({ where: { id: entry.subjectId }});
}

// ✅ Single Query with Include
const entries = await this.prisma.timetableEntry.findMany({
  include: {
    subject: true,
    teacher: true
  }
});
```

---

## 📝 **Migration from Mock Data**

### **Steps to Migrate:**

1. **Parse existing mock data**
   ```typescript
   const mockData = require('./mock-timetable-data.json');
   ```

2. **Extract unique entities**
   ```typescript
   const subjects = [...new Set(Object.values(mockData.timetable).map(e => e.subject))];
   const teachers = Object.keys(mockData.metadata.teachers);
   ```

3. **Create database records**
   ```typescript
   await prisma.subject.createMany({ 
     data: subjects.map(name => ({ name })) 
   });
   ```

4. **Create timetable entries** (skip breaks - they go in separate table)
   ```typescript
   for (const [cellKey, data] of Object.entries(mockData.timetable)) {
     if (data.isBreak) continue; // Breaks go in breaks table!
     
     const [gradeName, dayIndex, periodIndex] = cellKey.split('-');
     // ... create entry
   }
   ```

---

## 🔄 **Real-time Updates (Optional)**

If you want multiple users editing simultaneously:

### **WebSocket Event:**

```typescript
@WebSocketGateway()
export class TimetableGateway {
  @SubscribeMessage('joinGrade')
  handleJoinGrade(client: Socket, gradeId: string) {
    client.join(`grade-${gradeId}`);
  }

  async broadcastUpdate(gradeId: string, entry: TimetableEntry) {
    this.server
      .to(`grade-${gradeId}`)
      .emit('timetableUpdated', {
        type: 'ENTRY_CREATED',
        entry
      });
  }
}
```

---

## 📦 **Recommended NestJS Modules**

```bash
# Core
npm install @nestjs/common @nestjs/core

# Database (choose one)
npm install @nestjs/prisma prisma @prisma/client
# or
npm install @nestjs/typeorm typeorm pg

# Validation
npm install class-validator class-transformer

# Caching
npm install @nestjs/cache-manager cache-manager

# WebSocket (optional)
npm install @nestjs/websockets @nestjs/platform-socket.io
```

---

## 🎯 **Priority Order**

### **Week 1: Core Endpoints**
1. ✅ Set up database schema
2. ✅ Create CRUD endpoints
3. ✅ Add validation

### **Week 2: Conflict Detection**
4. ✅ Implement conflict checking
5. ✅ Return proper error responses
6. ✅ Add indexes for performance

### **Week 3+: Nice to Have**
7. ⚠️ Real-time updates
8. ⚠️ Statistics endpoint
9. ⚠️ Bulk operations

---

## 📄 **Full Details**

See **FRONTEND_API_CONTRACT.md** for:
- Complete API specification
- Request/response formats
- Error handling
- TypeScript types

---

## 🤝 **What Frontend Team Needs from You**

1. ✅ **API Base URL** - Where should we point requests?
2. ✅ **Auth Headers** - What format? Bearer token?
3. ✅ **Error Format** - Follow contract or send yours?
4. ✅ **Rate Limits** - Any limits we should know?
5. ✅ **Staging Environment** - URL for testing?
6. ✅ **OpenAPI/Swagger** - Auto-generated docs?

---

## 📊 **Performance Target**

- **GET requests**: < 100ms
- **POST/PUT/DELETE**: < 200ms
- **Conflict detection**: < 50ms
- **Bulk operations**: < 1s

With proper indexes and caching, these are easily achievable.

---

**Bottom Line**: 

1. ✅ **Don't use the current mock data structure** - it's inefficient
2. ✅ **Use proper database schema** - with foreign keys
3. ✅ **Store breaks once** - not per grade
4. ✅ **Return populated objects** - frontend needs complete data
5. ✅ **Validate on server** - prevent conflicts before saving

**The frontend is ready and optimized. Just need the API!** 🚀

