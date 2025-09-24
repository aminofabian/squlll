# Teacher Invitation GraphQL Fix

## The Problem

The GraphQL mutation was failing with the error:
```
{"error": "GraphQL errors: Input validation failed", "details": [...], "code": "VALIDATION_ERROR"}
```

There were two key issues causing this error:

1. **tenantId field**: The `tenantId` was being included in the `createTeacherDto` but it's not part of the GraphQL schema.
2. **Incorrect GraphQL format**: The mutation was using inline parameters instead of variables format.

## The Solution

### 1. Remove tenantId from the DTO

The GraphQL schema does not expect `tenantId` in the `CreateTeacherInvitationDto`. The backend handles tenantId authorization via the token.

```javascript
// Original object with tenantId
const createTeacherDto = {
  email: "teacher@example.com",
  // other fields...
  tenantId: "unwanted-tenant-id" // This breaks validation
};

// Remove tenantId using object destructuring
const { tenantId, ...cleanedTeacherDto } = createTeacherDto;

// Now cleanedTeacherDto can be sent to GraphQL
```

### 2. Use Variables Format for GraphQL Mutations

GraphQL mutations can be written two ways:

#### ✅ CORRECT: Variables Format
```graphql
mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
  inviteTeacher(createTeacherDto: $createTeacherDto) {
    email
    fullName
    status
    createdAt
  }
}
```

With variables sent separately:
```json
{
  "createTeacherDto": {
    "email": "teacher@example.com",
    "fullName": "Teacher Name",
    // other fields...
  }
}
```

#### ❌ INCORRECT: Inline Parameters Format
```graphql
mutation {
  inviteTeacher(
    createTeacherDto: {
      email: "teacher@example.com"
      fullName: "Teacher Name"
      # other fields...
    }
  ) {
    email
    fullName
    status
    createdAt
  }
}
```

### Fixed API Endpoint

The `/api/school/invite-teacher/route.ts` file has been updated to:
1. Remove `tenantId` from the DTO object using destructuring
2. Ensure the GraphQL request is properly formatted with variables
3. Add detailed validation and error messages

## Required Fields & Format

All teacher invitation DTOs must include these properly formatted fields:
- `email`: Valid email format
- `fullName`, `firstName`, `lastName`: Required strings
- `role`: Must be "TEACHER"
- `gender`: Must be "MALE" or "FEMALE" (uppercase)
- `department`: Required string (lowercase recommended)
- `phoneNumber`: Must start with + and have 10-15 digits
- `employeeId`: Required string
- `dateOfBirth`: Required date in YYYY-MM-DD format
- `qualifications`: Required string
- `tenantSubjectIds`: Required array of UUIDs with at least one element
- `tenantGradeLevelIds`: Required array of UUIDs with at least one element

## How To Test

Run the included test scripts:
1. `node test-tenantid-removal.js` - Verifies tenantId removal
2. `bun direct-teacher-invitation.js YOUR_TOKEN` - Tests direct GraphQL call

## Code Examples

A utility module has been created at `/lib/utils/graphql-helpers.ts` with helper functions for GraphQL requests.
