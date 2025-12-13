# GraphQL Non-Nullable Field Error - Week Templates

## The Problem

When querying `getWeekTemplates`, you were getting this error:

```json
{
  "errors": [
    {
      "message": "Cannot return null for non-nullable field WeekTemplate.term.",
      "path": ["getWeekTemplates", 0, "term"],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR"
      }
    }
  ]
}
```

## Root Cause

This error occurs when:
1. Your GraphQL schema defines `WeekTemplate.term` as a **non-nullable field** (type `Term!` instead of `Term`)
2. Some week templates in the database have `termId: null`
3. Your query tries to fetch the `term` relation for these templates

GraphQL cannot return `null` for a non-nullable field, so it fails the entire query.

---

## The Fix

### What Was Changed

**Before (❌ Broken):**
```graphql
query GetWeekTemplates($input: GetWeekTemplatesInput!) {
  getWeekTemplates(input: $input) {
    id
    name
    numberOfDays
    termId
    term {              # ← This fails when termId is null
      name
      startDate
      endDate
    }
  }
}
```

**After (✅ Fixed):**
```graphql
query GetWeekTemplates($input: GetWeekTemplatesInput!) {
  getWeekTemplates(input: $input) {
    id
    name
    numberOfDays
    termId             # ← Only fetch the ID, not the relation
    dayTemplates {
      # ... day template fields
    }
  }
}
```

### Files Changed

1. **`lib/stores/useTimetableStoreNew.ts`**
   - Removed `term { name, startDate, endDate }` from query
   - Kept `termId` for reference
   - Added logging for debugging

2. **`app/school/[subdomain]/(pages)/timetable/components/WeekTemplateManager.tsx`**
   - Already had `term?` as optional (no change needed)
   - UI already handles missing term with `template.term && ...`

3. **`test-week-templates.js`**
   - Removed `term` field from queries
   - Updated display to show `termId` instead of term details

---

## Why This Approach?

### Option 1: ✅ Don't Query the Relation (Chosen)

**Pros:**
- Works immediately without backend changes
- Avoids GraphQL null errors
- Still have `termId` for lookups if needed

**Cons:**
- Can't display term name/dates directly in UI
- Need separate query if term details are required

### Option 2: ❌ Fix Backend Schema (Not Done)

Make `term` nullable in your GraphQL schema:

```typescript
// In your GraphQL type definition
@ObjectType()
export class WeekTemplate {
  @Field()
  id: string;
  
  @Field()
  name: string;
  
  @Field(() => String, { nullable: true })  // ← Add nullable: true
  termId?: string;
  
  @Field(() => Term, { nullable: true })    // ← Add nullable: true
  term?: Term;
}
```

**Pros:**
- More accurate representation of data model
- Can query term when it exists

**Cons:**
- Requires backend code change
- Need to redeploy backend

### Option 3: ❌ Always Set termId (Not Recommended)

Ensure all week templates have a termId.

**Cons:**
- Week templates might be reusable across terms
- Not all templates need to be term-specific

---

## How to Handle Missing Term Data in UI

If you need to show term information, you have options:

### Option A: Show Only Term ID

```tsx
<CardDescription>
  {template.numberOfDays} days
  {template.termId && ` • Term ID: ${template.termId}`}
</CardDescription>
```

### Option B: Separate Query for Term Details

```typescript
// If you have termId and need term details
const fetchTermDetails = async (termId: string) => {
  const query = `
    query GetTerm($id: ID!) {
      getTerm(id: $id) {
        id
        name
        startDate
        endDate
      }
    }
  `;
  // ... fetch and return
};
```

### Option C: Accept No Term Display

```tsx
<CardDescription>
  {template.numberOfDays} days
  {/* Don't show term info */}
</CardDescription>
```

---

## Verification

After the fix, the query should now work:

```bash
# Test with the script
node test-week-templates.js

# Expected output:
✓ Found 1 week template(s)

  Template: Standard School Week
    ID: 59e4b161-12f7-413d-b4cf-2c9d96b87dff
    Days: 5
    Term ID: None (not associated with a term)
```

---

## Related GraphQL Error Patterns

This same error pattern can occur with any non-nullable field:

### Common Cases

```graphql
# If teacher is non-nullable but can be null:
query {
  getTimetableEntries {
    id
    teacher {  # ← Can fail if teacherId is null
      name
    }
  }
}

# If gradeLevel is non-nullable but can be null:
query {
  getStudents {
    id
    gradeLevel {  # ← Can fail if gradeLevelId is null
      name
    }
  }
}
```

### Solution Pattern

Always check if the ID field is nullable in your database:

1. **If the relation is truly optional** → Don't query it, or make it nullable in schema
2. **If the relation is required** → Add database constraints to ensure it's never null

---

## Prevention Tips

### 1. Make Relations Nullable by Default

When defining GraphQL types, make relations nullable unless they're truly required:

```typescript
@Field(() => Term, { nullable: true })  // ✅ Safe default
term?: Term;
```

### 2. Use Fragments for Optional Data

```graphql
query GetWeekTemplates($includeTerm: Boolean = false) {
  getWeekTemplates {
    id
    name
    ... @include(if: $includeTerm) {
      term {
        name
        startDate
      }
    }
  }
}
```

### 3. Check Database Constraints

```sql
-- Check if termId can be null
SELECT column_name, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'week_templates' 
  AND column_name = 'termId';
```

If `is_nullable = 'YES'`, then the GraphQL field should be nullable too.

---

## Testing After Fix

```bash
# 1. Test basic query
node test-week-templates.js

# 2. Test with details
node test-week-templates.js --update

# 3. Test in UI
# Open your app → Navigate to Templates tab
# Should see week templates without errors
```

---

## Summary

✅ **Fixed:** Removed non-nullable `term` relation from query  
✅ **Still Have:** `termId` for reference  
✅ **No Backend Changes:** Works with existing schema  
✅ **UI Compatible:** Already handles optional term  

If you need term details later, either:
- Fix the backend schema to make `term` nullable
- Do a separate query for term details using `termId`

