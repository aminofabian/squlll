# Break Deletion Guide

## Overview

This guide explains how to delete breaks from your timetable system and how to handle orphaned breaks that aren't properly associated with day templates.

---

## ✅ Working Break Deletion

### Mutation: deleteDayTemplateBreak

Deletes a single break that is associated with a day template.

**GraphQL Mutation:**
```graphql
mutation DeleteDayTemplateBreak($id: ID!) {
  deleteDayTemplateBreak(id: $id) {
    success
    message
  }
}
```

**Variables:**
```json
{
  "id": "7ecfde59-4265-4279-8dfe-2d48d9c94272"
}
```

**Expected Response:**
```json
{
  "data": {
    "deleteDayTemplateBreak": {
      "success": true,
      "message": "Break deleted and timetable recalculated."
    }
  }
}
```

---

### Mutation: deleteAllTimetableBreaks

Deletes all breaks in the system.

**GraphQL Mutation:**
```graphql
mutation DeleteAllTimetableBreaks {
  deleteAllTimetableBreaks
}
```

**Expected Response:**
```json
{
  "data": {
    "deleteAllTimetableBreaks": true
  }
}
```

---

## ⚠️ Common Issue: Orphaned Breaks

### What is an Orphaned Break?

An **orphaned break** is a break that exists in the database but is NOT associated with a day template. These breaks cannot be deleted using the standard `deleteDayTemplateBreak` mutation.

### Error When Deleting Orphaned Breaks

```json
{
  "errors": [
    {
      "message": "Break must be associated with a day template",
      "extensions": {
        "code": "BADREQUESTEXCEPTION"
      }
    }
  ],
  "data": null
}
```

### Why Do Orphaned Breaks Exist?

Orphaned breaks can occur when:
1. Breaks were created before the day template association was required
2. Day templates were deleted without properly cleaning up associated breaks
3. Data migration issues
4. Manual database modifications

---

## 🔍 Identifying Orphaned Breaks

### Using the Test Script

```bash
node test-break-deletion.js
```

The script will automatically categorize breaks:

**Output Example:**
```
✓ Found 5 break(s)

  3 Valid Breaks (can be deleted):
  
  1. Morning Tea ✓
     ID: abc-123
     Day Template ID: template-1
     Day: Monday
     Type: SHORT_BREAK
     Duration: 15 minutes
     
  ⚠ 2 Orphaned Breaks (NOT associated with day template):
  
  1. Lunch Break ⚠
     ID: xyz-789
     Type: LUNCH
     Duration: 45 minutes
     Status: Cannot be deleted (no day template association)
```

### Using GraphQL Query

```graphql
query GetAllDayTemplateBreaks {
  getAllDayTemplateBreaks {
    id
    name
    type
    dayTemplateId
    dayTemplate {
      id
      dayOfWeek
    }
    afterPeriod
    durationMinutes
  }
}
```

Check the response - breaks without `dayTemplateId` or `dayTemplate` are orphaned.

---

## 🔧 Fixing Orphaned Breaks

### Option 1: Re-create the Break Properly

1. Note the break details (name, type, duration, etc.)
2. Create a new break with proper day template association:

```graphql
mutation CreateDayTemplateBreak($input: CreateDayTemplateBreakInput!) {
  createDayTemplateBreak(input: $input) {
    id
    name
    type
    dayTemplateId
  }
}
```

**Variables:**
```json
{
  "input": {
    "dayTemplateId": "valid-day-template-id",
    "name": "Lunch Break",
    "type": "LUNCH",
    "afterPeriod": 4,
    "durationMinutes": 45,
    "icon": "🍽️",
    "color": "#10B981"
  }
}
```

3. Manually delete the orphaned break from the database (requires database access)

---

### Option 2: Database Clean-up (Requires DB Access)

If you have direct database access, you can:

**PostgreSQL Example:**
```sql
-- View orphaned breaks
SELECT id, name, type, "dayTemplateId" 
FROM day_template_breaks 
WHERE "dayTemplateId" IS NULL;

-- Delete specific orphaned break
DELETE FROM day_template_breaks 
WHERE id = 'orphaned-break-id';

-- Delete all orphaned breaks (CAUTION!)
DELETE FROM day_template_breaks 
WHERE "dayTemplateId" IS NULL;
```

---

### Option 3: Associate with Existing Day Template

If the break should exist but just needs to be linked:

**SQL Example:**
```sql
-- Update orphaned break to link to a day template
UPDATE day_template_breaks 
SET "dayTemplateId" = 'valid-day-template-id'
WHERE id = 'orphaned-break-id';
```

After updating, the break can be deleted normally using the GraphQL mutation.

---

## 📋 Using the Store Methods

### Frontend (React/TypeScript)

```typescript
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';

function BreakManager() {
  const { deleteBreak, loadBreaks } = useTimetableStore();

  const handleDeleteBreak = async (breakId: string) => {
    try {
      await deleteBreak(breakId);
      toast({
        title: 'Success',
        description: 'Break deleted successfully',
      });
      // Reload breaks
      await loadBreaks();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMsg.includes('not associated with a day template')) {
        // Handle orphaned break
        toast({
          title: 'Cannot Delete Break',
          description: 'This break is orphaned and needs to be fixed in the database',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    }
  };

  return (
    <button onClick={() => handleDeleteBreak('break-id')}>
      Delete Break
    </button>
  );
}
```

### Enhanced Error Handling

The store now validates breaks before deletion:

```typescript
// In useTimetableStoreNew.ts
deleteBreak: async (id: string) => {
  // Check if break exists
  const breakToDelete = state.breaks.find(b => b.id === id);
  
  if (!breakToDelete) {
    throw new Error('Break not found');
  }
  
  // Check if break has day template association
  if (!breakToDelete.dayTemplateId) {
    throw new Error(
      'Cannot delete break: Break is not associated with a day template. ' +
      'This break may be orphaned and needs to be fixed or deleted from the database directly.'
    );
  }
  
  // Proceed with deletion...
}
```

---

## 🧪 Testing Break Deletion

### Test Script Usage

```bash
# List all breaks (shows valid and orphaned)
node test-break-deletion.js

# Delete a specific break
node test-break-deletion.js --id=break-uuid-here

# Delete all breaks (CAUTION!)
node test-break-deletion.js --delete-all
```

### What the Script Does

1. **Loads all breaks** and categorizes them
2. **Validates** before attempting deletion
3. **Shows helpful warnings** for orphaned breaks
4. **Verifies deletion** by reloading breaks

---

## ✅ Best Practices

### 1. Always Associate Breaks with Day Templates

When creating breaks, always specify the `dayTemplateId`:

```typescript
const breakInput = {
  dayTemplateId: dayTemplate.id, // ← Required!
  name: 'Morning Tea',
  type: 'SHORT_BREAK',
  afterPeriod: 2,
  durationMinutes: 15,
};
```

### 2. Load Breaks Correctly

Ensure your query includes `dayTemplateId`:

```graphql
query GetAllDayTemplateBreaks {
  getAllDayTemplateBreaks {
    id
    name
    type
    dayTemplateId     # ← Important!
    dayTemplate {     # ← Also helpful
      id
      dayOfWeek
    }
    # ... other fields
  }
}
```

### 3. Validate Before Deletion

Always check if a break has a day template before attempting deletion:

```typescript
const canDelete = (breakItem: Break) => {
  return breakItem.dayTemplateId != null;
};

if (canDelete(breakItem)) {
  await deleteBreak(breakItem.id);
} else {
  showWarning('Cannot delete orphaned break');
}
```

### 4. Regular Maintenance

Periodically check for orphaned breaks:

```sql
-- Database query to find orphaned breaks
SELECT COUNT(*) as orphaned_count
FROM day_template_breaks 
WHERE "dayTemplateId" IS NULL;
```

### 5. Clean Up When Deleting Day Templates

If you delete a day template, clean up its breaks first:

```typescript
const deleteDayTemplate = async (templateId: string) => {
  // 1. Delete all breaks for this template
  const breaksToDelete = breaks.filter(b => b.dayTemplateId === templateId);
  await Promise.all(breaksToDelete.map(b => deleteBreak(b.id)));
  
  // 2. Then delete the template
  await deleteDayTemplate(templateId);
};
```

---

## 🚨 Troubleshooting

### Issue: "Break must be associated with a day template"

**Cause:** You're trying to delete an orphaned break  
**Solution:** Use one of the fixing methods above (re-create, database update, or manual deletion)

### Issue: Break appears in list but can't be deleted

**Cause:** The break's `dayTemplateId` is null  
**Solution:** Run the test script to identify orphaned breaks, then fix them

### Issue: Deleted break still appears after deletion

**Cause:** Cache issue or deletion failed  
**Solution:** Reload breaks using `loadBreaks()` or refresh the page

---

## 📝 Summary

**Valid Breaks:**
- ✅ Have `dayTemplateId` set
- ✅ Can be deleted with `deleteDayTemplateBreak` mutation
- ✅ Are properly managed by the system

**Orphaned Breaks:**
- ❌ Do NOT have `dayTemplateId` set
- ❌ CANNOT be deleted with standard mutation
- ⚠️ Need manual intervention (database or re-creation)

**Prevention:**
- Always create breaks with `dayTemplateId`
- Validate data when loading
- Regular maintenance checks
- Proper cleanup when deleting day templates

---

## 📚 Related Documentation

- [Week Template Guide](./WEEK_TEMPLATE_GUIDE.md)
- [Timetable Backend Architecture](./TIMETABLE_BACKEND_ARCHITECTURE.md)

---

## 🆘 Need Help?

If you encounter orphaned breaks:
1. Run `node test-break-deletion.js` to identify them
2. Use the database queries above to inspect
3. Choose a fixing method based on your situation
4. Contact your database administrator if you don't have direct DB access

