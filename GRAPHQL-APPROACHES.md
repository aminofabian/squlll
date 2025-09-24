# GraphQL Mutation Approaches

When working with GraphQL, there are two approaches for writing mutations:

## 1. Inline Parameters Format 

This is the format that works with your API as confirmed.

```graphql
mutation InviteRegularTeacher {
  inviteTeacher(
    createTeacherDto: {
      email: "example@example.com"
      fullName: "Full Name"
      firstName: "First"
      lastName: "Name"
      role: "TEACHER"
      gender: "MALE"
      department: "Science"
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

## 2. Variables Format

This is a more standard and flexible format, but wasn't initially working with your API:

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

With variables:
```json
{
  "createTeacherDto": {
    "email": "example@example.com",
    "fullName": "Full Name",
    "firstName": "First",
    "lastName": "Name",
    "role": "TEACHER",
    "gender": "MALE",
    "department": "science",
    # other fields...
  }
}
```

## Key Issues Fixed

Regardless of the approach used, these issues were fixed:

1. **tenantId removal**: The `tenantId` field is not part of the GraphQL schema, so it was removed from the DTO using object destructuring:
   ```javascript
   const { tenantId, ...cleanedTeacherDto } = createTeacherDto;
   ```

2. **Department case**: The `department` field should be lowercase (e.g., "science" not "Science").

3. **Array handling**: Both `tenantSubjectIds` and `tenantGradeLevelIds` must be arrays of strings.

## Helper Functions

New helper functions have been added in `/lib/utils/graphql-helpers.ts`:

1. `cleanGraphQLDto(dto)`: Removes tenantId from any DTO

2. `buildInlineGraphQLMutation(operationName, dto, returnFields)`: Creates an inline mutation string

3. `createTeacherInvitationRequest(teacherData)`: Creates a variables format request

4. `createTeacherInvitationInline(teacherData)`: Creates an inline format request

## API Route Updates

The `/api/school/invite-teacher/route.ts` has been updated to:

1. Use the inline mutation format that's confirmed working
2. Remove tenantId from the DTO
3. Format fields correctly (arrays, department case, etc.)

## Example Usage

### Direct GraphQL Calls with Inline Format

```javascript
// Import the helper
import { createTeacherInvitationInline } from '@/lib/utils/graphql-helpers';

// Teacher data with tenantId (will be removed by helper)
const teacherData = {
  email: "teacher@example.com",
  // ...other fields
  tenantId: "not-needed-tenant-id" // Will be removed
};

// Create the request with proper inline format
const request = createTeacherInvitationInline(teacherData);

// Make the fetch request
const response = await fetch('https://skool.zelisline.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(request)
});
```

## Important Note

When inviting teachers, make sure that:
1. The tenantId is NOT included in the createTeacherDto
2. All required fields are present and correctly formatted
3. Arrays (tenantSubjectIds, tenantGradeLevelIds) are properly formatted
