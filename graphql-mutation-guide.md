# GraphQL Mutation Guide for Teacher Invitation

## Two Ways to Write GraphQL Mutations

There are two ways to write GraphQL mutations:

### 1. Variables Format (RECOMMENDED ✅)

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

With variables passed separately:

```json
{
  "createTeacherDto": {
    "email": "teacher@example.com",
    "fullName": "Teacher Name",
    "firstName": "Teacher",
    "lastName": "Name",
    "role": "TEACHER",
    "gender": "MALE",
    "department": "science",
    "phoneNumber": "+254712345678",
    "address": "123 Address St",
    "employeeId": "EMP123",
    "dateOfBirth": "1990-01-01",
    "qualifications": "BSc Education",
    "tenantSubjectIds": ["subject-uuid-1"],
    "tenantGradeLevelIds": ["grade-uuid-1"]
  }
}
```

### 2. Inline Parameters Format (NOT RECOMMENDED ❌)

```graphql
mutation {
  inviteTeacher(
    createTeacherDto: {
      email: "teacher@example.com"
      fullName: "Teacher Name"
      firstName: "Teacher"
      lastName: "Name"
      role: "TEACHER"
      gender: "MALE"
      department: "science"
      phoneNumber: "+254712345678"
      address: "123 Address St"
      employeeId: "EMP123"
      dateOfBirth: "1990-01-01"
      qualifications: "BSc Education"
      tenantSubjectIds: ["subject-uuid-1"]
      tenantGradeLevelIds: ["grade-uuid-1"]
    }
  ) {
    email
    fullName
    status
    createdAt
  }
}
```

## Which to Use?

- **Use Variables Format**: Most GraphQL APIs (including yours) expect you to use the variables format. It's safer, cleaner, and avoids many parsing issues.

- **Avoid Inline Parameters**: While some APIs may support this format, it's more prone to errors, especially with complex nested objects.

## Common Errors

1. **Input validation failed**: This often occurs when using inline parameters instead of variables, or when a required field is missing.

2. **Field X is not defined by type Y**: Occurs when you include fields that aren't part of the schema (like including `tenantId` in your `createTeacherDto`).

## How to Test in GraphQL Playground

1. Enter the mutation with the `$createTeacherDto` parameter in the main editor:
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

2. Click on "QUERY VARIABLES" at the bottom and add:
   ```json
   {
     "createTeacherDto": {
       "email": "test@example.com",
       "fullName": "Test Teacher",
       // Add all other required fields...
     }
   }
   ```

3. Click the "Play" button to run the mutation

## Field Requirements

- **department**: Must be lowercase (e.g., "science" not "Science")
- **gender**: Must be "MALE" or "FEMALE" (uppercase)
- **tenantSubjectIds**: Must be an array of UUIDs with at least one element
- **tenantGradeLevelIds**: Must be an array of UUIDs with at least one element
- **tenantId**: Do NOT include this field in the createTeacherDto object
