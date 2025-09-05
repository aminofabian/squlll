# UpdateCustomSubject Mutation Implementation

This document explains how to use the `updateCustomSubject` mutation that has been implemented in the codebase.

## API Endpoint

**URL:** `/api/school/update-custom-subject`  
**Method:** `POST`  
**Authentication:** Required (Bearer token via cookies)

## Request Format

```json
{
  "tenantSubjectId": "635db0d0-d864-49b6-98fb-c8d53d4bd147",
  "input": {
    "name": "Updated to najaribu",
    "totalMarks": 120,
    "isCompulsory": true
  }
}
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": "8b2f2025-dceb-4239-b5da-1105108a6861",
    "customSubject": {
      "id": "a21d43a9-e2f3-474f-ad46-9527a5d5a40a",
      "name": "Updated to najarib1u"
    },
    "isCompulsory": true,
    "totalMarks": 120
  },
  "message": "Custom subject updated successfully"
}
```

### Error Response (400/401/500)
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "graphqlErrors": [] // If GraphQL errors occurred
}
```

## GraphQL Mutation

The underlying GraphQL mutation used is:

```graphql
mutation UpdateCustomSubject($tenantSubjectId: String!, $input: UpdateTenantSubjectInput!) {
  updateCustomSubject(tenantSubjectId: $tenantSubjectId, input: $input) {
    id
    customSubject {
      id
      name
    }
    isCompulsory
    totalMarks
  }
}
```

## Frontend Component Usage

The `EditSubjectDialog` component has been updated to support the new mutation:

```tsx
<EditSubjectDialog
  subject={subject}
  isOpen={isDialogOpen}
  onClose={() => setIsDialogOpen(false)}
  onSave={handleSubjectSave}
  tenantSubjectId="635db0d0-d864-49b6-98fb-c8d53d4bd147" // Include this for GraphQL updates
/>
```

### Props

- `subject`: The subject object to edit
- `isOpen`: Dialog open state
- `onClose`: Callback when dialog closes
- `onSave`: Callback when subject is saved
- `tenantSubjectId` (optional): If provided, uses GraphQL mutation; otherwise uses callback

## Validation

The API performs the following validations:

1. **Authentication**: Valid access token required
2. **tenantSubjectId**: Must be provided and non-empty
3. **input.name**: Required string field
4. **input.totalMarks**: Optional positive number
5. **input.isCompulsory**: Optional boolean

## Testing

Run the test script to verify the implementation:

```bash
node test-update-custom-subject.js
```

**Note:** Tests require:
- Development server running (`bun dev`)
- Valid authentication cookies
- Existing tenantSubjectId in database

## Error Handling

The implementation includes comprehensive error handling for:

- Missing authentication
- Invalid input data
- GraphQL errors
- Network failures
- Server errors

Errors are displayed to users via toast notifications in the frontend component.

## Files Modified/Created

1. `/app/api/school/update-custom-subject/route.ts` - New API endpoint
2. `/app/school/[subdomain]/(pages)/components/EditSubjectDialog.tsx` - Updated component
3. `test-update-custom-subject.js` - Test script
4. `UPDATE_CUSTOM_SUBJECT_USAGE.md` - This documentation

## Example Usage

```javascript
// Direct API call
const response = await fetch('/api/school/update-custom-subject', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    tenantSubjectId: "635db0d0-d864-49b6-98fb-c8d53d4bd147",
    input: {
      name: "Updated to najaribu",
      totalMarks: 120,
      isCompulsory: true
    }
  })
});

const result = await response.json();
if (result.success) {
  console.log('Subject updated:', result.data);
}
```
