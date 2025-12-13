# Week Template Management Guide

This guide explains how to query and manage weekly timetable templates in your application.

## Overview

Week templates define the structure of your school's weekly schedule, including:
- Number of days in the week
- Start time for each day
- Number of periods per day
- Duration of each period
- Assignment to grade levels and streams

## Available Operations

### 1. Load Week Templates

Retrieves all week templates in the system with optional detailed information.

#### Basic Query (No Details)

```graphql
query GetWeekTemplates($input: GetWeekTemplatesInput!) {
  getWeekTemplates(input: $input) {
    id
    name
    numberOfDays
    termId
    term {
      name
      startDate
      endDate
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "includeDetails": false
  }
}
```

#### Full Details Query

```graphql
query GetWeekTemplates($input: GetWeekTemplatesInput!) {
  getWeekTemplates(input: $input) {
    id
    name
    numberOfDays
    termId
    term {
      name
      startDate
      endDate
    }
    dayTemplates {
      id
      dayOfWeek
      startTime
      periodCount
      gradeLevels {
        id
        name
      }
      streams {
        id
        stream {
          name
        }
      }
      periods {
        id
        periodNumber
        startTime
        endTime
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "includeDetails": true
  }
}
```

**Response:**
- Returns array of week templates
- When `includeDetails: true`, includes full day templates with periods, grade levels, and streams
- When `includeDetails: false`, returns only basic template information

---

### 2. Update Week Template

Updates the default start time for a week template. This resets all day templates and recalculates period times.

**Mutation:**
```graphql
mutation UpdateWeekTemplate($input: UpdateWeekTemplateInput!) {
  updateWeekTemplate(input: $input) {
    id
    defaultStartTime
    dayTemplates {
      id
      dayOfWeek
      startTime
      periods {
        periodNumber
        startTime
        endTime
      }
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "id": "628a7e44-83a6-4ebd-9830-3d570096c712",
    "defaultStartTime": "08:30"
  }
}
```

**Parameters:**
- `id` (required): Week template ID
- `defaultStartTime` (required): New start time in HH:mm format

**Notes:**
- Recalculates all period times based on the new start time
- Maintains existing period count and duration
- All day templates are updated automatically

---

### 3. Rebuild Week Template Periods

Fully rebuilds the period structure of a week template. This can change the number of periods and requires explicit confirmation if timetable entries exist.

**Mutation:**
```graphql
mutation RebuildWeekTemplatePeriods(
  $id: String!
  $startTime: String!
  $periodCount: Int!
  $periodDuration: Int!
  $force: Boolean
) {
  rebuildWeekTemplatePeriods(
    id: $id
    startTime: $startTime
    periodCount: $periodCount
    periodDuration: $periodDuration
    force: $force
  ) {
    id
    defaultPeriodCount
    dayTemplates {
      id
      periods {
        id
        periodNumber
        startTime
        endTime
      }
    }
  }
}
```

**Variables:**
```json
{
  "id": "b08814a2-80a2-4992-b09c-cedc75a1a76a",
  "startTime": "08:00",
  "periodCount": 9,
  "periodDuration": 40,
  "force": false
}
```

**Parameters:**
- `id` (required): Week template ID
- `startTime` (required): New start time in HH:mm format
- `periodCount` (required): Number of periods to create
- `periodDuration` (required): Duration of each period in minutes
- `force` (optional): Set to `true` to force rebuild even if timetable entries exist

**Important:**
- If `force: false` and timetable entries exist, the mutation will fail with an error message
- If `force: true`, all existing timetable entries will be PERMANENTLY DELETED
- This operation cannot be undone
- Use with caution in production environments

**Error Handling:**
```
"cannot rebuild periods. N timetable entries exist. Use force: true to delete entries and rebuild (THIS CANNOT BE UNDONE)"
```

If you receive this error, you must explicitly set `force: true` to proceed.

---

## Using the Store (Frontend)

The functionality is integrated into the `useTimetableStore` Zustand store:

```typescript
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';

function MyComponent() {
  const { 
    loadWeekTemplates, 
    updateWeekTemplate, 
    rebuildWeekTemplatePeriods 
  } = useTimetableStore();

  // Load templates
  const loadTemplates = async () => {
    const templates = await loadWeekTemplates(true); // true = include details
    console.log(templates);
  };

  // Update template
  const updateTemplate = async (templateId: string) => {
    const result = await updateWeekTemplate({
      id: templateId,
      defaultStartTime: '08:30',
    });
    console.log(result);
  };

  // Rebuild periods
  const rebuildPeriods = async (templateId: string) => {
    try {
      const result = await rebuildWeekTemplatePeriods({
        id: templateId,
        startTime: '08:00',
        periodCount: 9,
        periodDuration: 40,
        force: false,
      });
      console.log(result);
    } catch (error) {
      // Handle error - might need to set force: true
      console.error(error);
    }
  };
}
```

---

## Using the UI Component

A complete UI component is available at:
```
app/school/[subdomain]/(pages)/timetable/components/WeekTemplateManager.tsx
```

**Features:**
- Load templates with basic or full details
- View all day templates and periods
- Update template start time with visual feedback
- Rebuild periods with safety checks
- Automatic error handling for force rebuild scenario

**To use:**
```tsx
import { WeekTemplateManager } from './components/WeekTemplateManager';

function TimetablePage() {
  return (
    <div>
      {/* Other timetable components */}
      <WeekTemplateManager />
    </div>
  );
}
```

---

## Testing

A comprehensive test script is available:

```bash
# Basic load test only
node test-week-templates.js

# Include update test
node test-week-templates.js --update

# Include rebuild test
node test-week-templates.js --rebuild

# Force rebuild (deletes entries)
node test-week-templates.js --rebuild --force
```

**Prerequisites:**
- Server must be running on `http://localhost:3000`
- Valid authentication cookies in `cookies.txt`
- At least one week template must exist in the database

---

## Best Practices

### 1. Loading Templates
- Use `includeDetails: false` for listing/dropdown views
- Use `includeDetails: true` only when you need full structure
- Cache results where appropriate

### 2. Updating Templates
- Use `updateWeekTemplate` for simple time adjustments
- This is safe and won't delete existing timetable data
- All periods are recalculated automatically

### 3. Rebuilding Periods
- **Always try with `force: false` first**
- If entries exist, prompt the user with a clear warning
- Only use `force: true` after explicit user confirmation
- Consider backing up data before force rebuild
- Document the rebuild for audit purposes

### 4. Error Handling
```typescript
try {
  await rebuildWeekTemplatePeriods({ ...params, force: false });
} catch (error) {
  const errorMsg = error.message;
  
  if (errorMsg.includes('cannot rebuild periods') && 
      errorMsg.includes('timetable entries exist')) {
    // Show user a confirmation dialog
    const confirmed = await confirmWithUser(
      'This will delete existing timetable entries. Continue?'
    );
    
    if (confirmed) {
      await rebuildWeekTemplatePeriods({ ...params, force: true });
    }
  } else {
    // Handle other errors
    showError(errorMsg);
  }
}
```

---

## Common Use Cases

### View All Week Templates
```typescript
const templates = await loadWeekTemplates(false);
```

### View Template with Full Structure
```typescript
const templates = await loadWeekTemplates(true);
```

### Change School Start Time (8:00 AM → 8:30 AM)
```typescript
await updateWeekTemplate({
  id: templateId,
  defaultStartTime: '08:30',
});
```

### Change Number of Periods (8 → 9)
```typescript
// Try without force first
try {
  await rebuildWeekTemplatePeriods({
    id: templateId,
    startTime: '08:00',
    periodCount: 9,
    periodDuration: 40,
    force: false,
  });
} catch (error) {
  // If entries exist, ask user to confirm
  if (userConfirms) {
    await rebuildWeekTemplatePeriods({
      id: templateId,
      startTime: '08:00',
      periodCount: 9,
      periodDuration: 40,
      force: true, // Delete existing entries
    });
  }
}
```

### Change Period Duration (40min → 45min)
```typescript
await rebuildWeekTemplatePeriods({
  id: templateId,
  startTime: '08:00',
  periodCount: 8,
  periodDuration: 45, // Changed from 40 to 45
  force: false, // or true if entries exist
});
```

---

## API Reference

### Store Methods

#### `loadWeekTemplates(includeDetails?: boolean): Promise<WeekTemplate[]>`
Loads all week templates from the backend.

**Parameters:**
- `includeDetails` (optional, default: `false`): Whether to include full day template details

**Returns:** Promise resolving to array of week templates

---

#### `updateWeekTemplate(input: { id: string; defaultStartTime?: string }): Promise<WeekTemplate>`
Updates a week template's default start time.

**Parameters:**
- `id` (required): Week template ID
- `defaultStartTime` (optional): New start time in HH:mm format

**Returns:** Promise resolving to updated week template

---

#### `rebuildWeekTemplatePeriods(input: RebuildInput): Promise<WeekTemplate>`
Rebuilds the period structure of a week template.

**Parameters:**
```typescript
interface RebuildInput {
  id: string;              // Week template ID
  startTime: string;       // Start time (HH:mm)
  periodCount: number;     // Number of periods
  periodDuration: number;  // Period duration in minutes
  force?: boolean;         // Force rebuild (deletes entries)
}
```

**Returns:** Promise resolving to rebuilt week template

**Throws:** Error if `force: false` and timetable entries exist

---

## Troubleshooting

### "cannot rebuild periods" Error
**Problem:** Trying to rebuild periods when timetable entries exist  
**Solution:** Set `force: true` or delete entries manually first

### Template Not Found
**Problem:** Invalid template ID  
**Solution:** Load templates first and use a valid ID

### Invalid Time Format
**Problem:** Start time not in HH:mm format  
**Solution:** Use format like "08:00" or "14:30"

### Periods Not Updating
**Problem:** Changes not reflected in UI  
**Solution:** Reload templates with `includeDetails: true` after mutations

---

## Related Documentation

- [Timetable Backend Architecture](./TIMETABLE_BACKEND_ARCHITECTURE.md)
- [Timetable Flow Analysis](./TIMETABLE_FLOW_ANALYSIS.md)
- [Timetable Optimization](./TIMETABLE_OPTIMIZATION.md)

