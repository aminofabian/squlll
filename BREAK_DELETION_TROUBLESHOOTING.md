# Break Deletion Troubleshooting Guide

## Internal Server Error During Break Deletion

If you're getting this error:

```json
{
  "errors": [
    {
      "message": "Internal server error",
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ]
}
```

This indicates a **backend/database issue** that's preventing the break from being deleted.

---

## 🔍 Common Causes

### 1. Database Foreign Key Constraints

**Problem:** The break has related records that prevent deletion

**Check:**
```sql
-- Check if there are any foreign key constraints on the breaks table
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name='day_template_breaks';
```

**Solution:**
- Delete related records first
- Or add `ON DELETE CASCADE` to the foreign key
- Or handle deletion of related records in the backend mutation

---

### 2. Circular References or Self-Referencing

**Problem:** The break table has a self-referencing relationship

**Check:**
```sql
-- Check the break record and its relationships
SELECT * FROM day_template_breaks WHERE id = 'your-break-id';

-- Check if there are any self-references
SELECT * FROM day_template_breaks WHERE "parentBreakId" = 'your-break-id';
```

**Solution:**
- Delete child records before parent
- Update backend to handle cascade deletion

---

### 3. Trigger Failure

**Problem:** A database trigger is failing during deletion

**Check:**
```sql
-- List all triggers on the breaks table
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'day_template_breaks';
```

**Solution:**
- Review trigger logic
- Temporarily disable trigger for testing
- Fix trigger to handle edge cases

---

### 4. Backend Validation Error

**Problem:** Backend code is throwing an error before deletion

**What to check:**
- Review your GraphQL resolver for `deleteDayTemplateBreak`
- Look for any `@BeforeDelete` decorators in your entity
- Check for any business logic validation

**Example issue:**
```typescript
// In your resolver or service
@BeforeDelete()
async beforeDelete(event: RemoveEvent<DayTemplateBreak>) {
  // This might be throwing an error
  if (someCondition) {
    throw new Error('Cannot delete break'); // ← This causes INTERNAL_SERVER_ERROR
  }
}
```

**Solution:**
- Add proper error handling in backend
- Return meaningful error messages
- Log the actual error on the server

---

### 5. Transaction Conflicts

**Problem:** The deletion is part of a transaction that's failing

**Check backend logs for:**
- Deadlock errors
- Transaction timeout
- Concurrent modification conflicts

**Solution:**
- Review transaction isolation level
- Add retry logic for transient failures
- Ensure proper transaction cleanup

---

## 🛠️ Diagnostic Steps

### Step 1: Enable Detailed Logging

Add this to your backend NestJS resolver:

```typescript
@Mutation(() => DeleteBreakResponse)
async deleteDayTemplateBreak(@Args('id', { type: () => ID }) id: string) {
  try {
    console.log('Attempting to delete break:', id);
    
    // Find the break first
    const breakToDelete = await this.breakRepository.findOne({ 
      where: { id },
      relations: ['dayTemplate', 'anyOtherRelations']
    });
    
    console.log('Break found:', breakToDelete);
    
    if (!breakToDelete) {
      throw new Error('Break not found');
    }
    
    if (!breakToDelete.dayTemplateId) {
      throw new BadRequestException('Break must be associated with a day template');
    }
    
    // Attempt deletion
    console.log('Deleting break...');
    await this.breakRepository.remove(breakToDelete);
    
    console.log('Break deleted successfully');
    
    return {
      success: true,
      message: 'Break deleted and timetable recalculated.',
    };
  } catch (error) {
    console.error('Error in deleteDayTemplateBreak:', error);
    console.error('Error stack:', error.stack);
    throw error; // Re-throw to see in GraphQL response
  }
}
```

### Step 2: Check Database Logs

**PostgreSQL:**
```bash
tail -f /var/log/postgresql/postgresql-14-main.log
```

Look for:
- Constraint violation errors
- Foreign key errors
- Trigger errors

### Step 3: Test Direct Database Deletion

Try deleting directly in SQL to see the actual error:

```sql
-- This will show you the actual constraint error
DELETE FROM day_template_breaks WHERE id = 'your-break-id';
```

If this fails, the error message will tell you exactly what's blocking the deletion.

### Step 4: Check Break Dependencies

```sql
-- Check what's referencing this break
SELECT 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE ccu.table_name = 'day_template_breaks'
  AND tc.constraint_type = 'FOREIGN KEY';
```

---

## 🔧 Common Fixes

### Fix 1: Add Cascade Deletion

If breaks should be deleted when day templates are deleted:

```typescript
// In your DayTemplateBreak entity
@ManyToOne(() => DayTemplate, dayTemplate => dayTemplate.breaks, {
  onDelete: 'CASCADE', // ← Add this
})
dayTemplate: DayTemplate;
```

### Fix 2: Manual Cleanup Before Deletion

```typescript
async deleteDayTemplateBreak(id: string) {
  const breakToDelete = await this.breakRepository.findOne({
    where: { id },
    relations: ['relatedRecords']
  });
  
  // Clean up related records first
  if (breakToDelete.relatedRecords?.length > 0) {
    await this.relatedRecordsRepository.remove(breakToDelete.relatedRecords);
  }
  
  // Now safe to delete
  await this.breakRepository.remove(breakToDelete);
}
```

### Fix 3: Better Error Handling

```typescript
async deleteDayTemplateBreak(id: string) {
  try {
    const breakToDelete = await this.breakRepository.findOne({ 
      where: { id } 
    });
    
    if (!breakToDelete) {
      throw new NotFoundException(`Break with ID ${id} not found`);
    }
    
    if (!breakToDelete.dayTemplateId) {
      throw new BadRequestException(
        'Break must be associated with a day template'
      );
    }
    
    await this.breakRepository.remove(breakToDelete);
    
    return { success: true, message: 'Break deleted successfully' };
  } catch (error) {
    // Log the actual error
    this.logger.error(`Failed to delete break ${id}:`, error);
    
    // Return user-friendly message
    if (error.code === '23503') { // Foreign key violation
      throw new BadRequestException(
        'Cannot delete break: it is referenced by other records'
      );
    }
    
    throw error;
  }
}
```

---

## 📊 Frontend Diagnostic Info

When a break fails to delete, check the browser console. The enhanced logging will show:

```
Attempting to delete break: {
  id: "abc-123",
  breakFound: true,
  breakDetails: {
    name: "Lunch Break",
    dayTemplateId: "template-456",
    dayOfWeek: 3,
    afterPeriod: 4
  }
}

Sending delete mutation for break ID: abc-123

Delete break response: {
  errors: [{
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    path: ["deleteDayTemplateBreak"]
  }]
}
```

This tells you:
- ✅ Break exists in frontend store
- ✅ Break has day template association
- ✅ Request was sent correctly
- ❌ **Backend is rejecting the deletion**

---

## 🚨 Emergency: Force Delete from Database

**⚠️ USE WITH CAUTION - Only if you understand the implications**

```sql
-- First, check what would be deleted
SELECT * FROM day_template_breaks WHERE id = 'problematic-break-id';

-- Check for any references
-- (This query varies based on your schema)

-- Force delete (will fail if constraints exist)
DELETE FROM day_template_breaks WHERE id = 'problematic-break-id';

-- If you get a constraint error, you need to delete referenced records first
-- Example:
-- DELETE FROM timetable_entries WHERE break_id = 'problematic-break-id';
-- DELETE FROM day_template_breaks WHERE id = 'problematic-break-id';
```

---

## 📋 Testing After Fix

After applying a fix:

1. **Test with script:**
```bash
node test-break-deletion.js --id=<break-id>
```

2. **Check logs:**
   - Backend server logs
   - Database logs  
   - Browser console

3. **Verify in UI:**
   - Break should be removed from list
   - No error toasts should appear
   - Timetable should reflect changes

---

## 💡 Prevention Tips

1. **Design Schema Carefully:**
   - Use appropriate cascade rules
   - Document all foreign key relationships
   - Consider soft deletes for audit trail

2. **Backend Validation:**
   - Check all constraints before deletion
   - Provide specific error messages
   - Log all deletion attempts

3. **Transaction Safety:**
   - Wrap deletions in transactions
   - Handle rollbacks properly
   - Test edge cases

4. **Testing:**
   - Test deletion in development
   - Test with related records
   - Test concurrent deletions

---

## 📚 Related Documentation

- [Break Deletion Guide](./BREAK_DELETION_GUIDE.md) - Complete deletion documentation
- [Week Template Guide](./WEEK_TEMPLATE_GUIDE.md) - Template management
- [Database Schema](./DATABASE_SCHEMA.md) - If you have one

---

## 🆘 Still Stuck?

If none of these solutions work:

1. **Check your backend logs** - The actual error is logged there
2. **Try SQL deletion** - See the actual database error
3. **Check your entity relationships** - Look for circular refs
4. **Ask for help** - Share the backend error logs with your team

The "Internal server error" is just GraphQL hiding the real error. The actual problem is in your backend logs! 🔍

