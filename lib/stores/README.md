# Stores

This directory contains Zustand stores for managing application state. These stores provide centralized ways to manage data with React Query integration.

## Students Store

The students store provides a centralized way to manage student data with React Query integration.

## Students Store (`useStudentsStore.ts`)

A Zustand store for managing student data with the following features:

### State
- `students`: Array of student objects
- `isLoading`: Loading state
- `error`: Error state

### Actions
- `setStudents(students)`: Set the students array
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error state
- `addStudent(student)`: Add a new student
- `updateStudent(studentId, updates)`: Update an existing student
- `removeStudent(studentId)`: Remove a student
- `reset()`: Reset store to initial state

### Getters
- `getStudentById(studentId)`: Get student by ID
- `getStudentsByTenantId(tenantId)`: Get students by tenant ID
- `getStudentByAdmissionNumber(admissionNumber)`: Get student by admission number
- `getStudentByEmail(email)`: Get student by email

## React Query Hook (`useStudents.ts`)

A React Query hook that integrates with the students store:

### `useStudents()`
Fetches students data and automatically updates the store:
```tsx
const { isLoading, isError, error, refetch, data } = useStudents();
```

### `useStudentsFromStore()`
Get students data directly from the store:
```tsx
const { students, isLoading, error } = useStudentsFromStore();
```

### `useStudentById(studentId)`
Get a specific student by ID:
```tsx
const student = useStudentById('student-id');
```

### `useStudentsByTenantId(tenantId)`
Get students filtered by tenant ID:
```tsx
const students = useStudentsByTenantId('tenant-id');
```

## API Route (`/api/students`)

The API route forwards the GraphQL query to the external API:

```graphql
query {
  students {
    id
    admission_number
    phone
    tenantId
    user {
      email
    }
  }
}
```

## Usage Example

```tsx
import { useStudents, useStudentsFromStore } from '@/lib/hooks/useStudents';

const MyComponent = () => {
  // Fetch students data
  const { isLoading, isError, error, refetch } = useStudents();
  
  // Get students from store
  const { students } = useStudentsFromStore();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Students ({students.length})</h1>
      <button onClick={() => refetch()}>Refresh</button>
      {students.map(student => (
        <div key={student.id}>
          {student.admission_number} - {student.user.email}
        </div>
      ))}
    </div>
  );
};
```

## Features

- **Automatic Caching**: React Query handles caching with 5-minute stale time
- **Error Handling**: Comprehensive error handling with retry functionality
- **Loading States**: Built-in loading states for better UX
- **Type Safety**: Full TypeScript support with proper types
- **DevTools**: Zustand DevTools integration for debugging
- **Optimistic Updates**: Store supports optimistic updates for better UX

## Teachers Store

The teachers store provides a centralized way to manage teacher data with React Query integration.

### Teachers Store (`useTeachersStore.ts`)

A Zustand store for managing teacher data with the following features:

#### State
- `teachers`: Array of teacher objects
- `isLoading`: Loading state
- `error`: Error state

#### Actions
- `setTeachers(teachers)`: Set the teachers array
- `setLoading(loading)`: Set loading state
- `setError(error)`: Set error state
- `addTeacher(teacher)`: Add a new teacher
- `updateTeacher(teacherId, updates)`: Update an existing teacher
- `removeTeacher(teacherId)`: Remove a teacher
- `reset()`: Reset store to initial state

#### Getters
- `getTeacherById(teacherId)`: Get teacher by ID
- `getTeachersByTenantId(tenantId)`: Get teachers by tenant ID
- `getTeacherByEmail(email)`: Get teacher by email
- `getTeacherByName(name)`: Get teacher by name

### React Query Hook (`useTeachers.ts`)

A React Query hook that integrates with the teachers store:

#### `useTeachers()`
Fetches teachers data for the current tenant (from cookies) and automatically updates the store:
```tsx
const { isLoading, isError, error, refetch, data } = useTeachers();
```

#### `useTeachersFromStore()`
Get teachers data directly from the store:
```tsx
const { teachers, isLoading, error } = useTeachersFromStore();
```

#### `useTeacherById(teacherId)`
Get a specific teacher by ID:
```tsx
const teacher = useTeacherById('teacher-id');
```

#### `useTeachersByTenantId(tenantId)`
Get teachers filtered by tenant ID:
```tsx
const teachers = useTeachersByTenantId('tenant-id');
```

#### `useTeacherByEmail(email)`
Get a teacher by email:
```tsx
const teacher = useTeacherByEmail('teacher@example.com');
```

### API Route (`/api/teachers`)

The API route forwards the GraphQL query to the external API. The tenant ID is automatically obtained from cookies:

```graphql
query GetTeachersByTenant($tenantId: String!) {
  getTeachersByTenant(tenantId: $tenantId) {
    id
    name
    email
    tenantId
    userId
  }
}
```

### Usage Example

```tsx
import { useTeachers, useTeachersFromStore } from '@/lib/hooks/useTeachers';

const MyComponent = () => {
  // Fetch teachers data for current tenant (from cookies)
  const { isLoading, isError, error, refetch } = useTeachers();
  
  // Get teachers from store
  const { teachers } = useTeachersFromStore();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div>
      <h1>Teachers ({teachers.length})</h1>
      <button onClick={() => refetch()}>Refresh</button>
      {teachers.map(teacher => (
        <div key={teacher.id}>
          {teacher.name} - {teacher.email}
        </div>
      ))}
    </div>
  );
};
```

### Features

- **Automatic Tenant Detection**: Automatically gets tenant ID from cookies
- **Automatic Caching**: React Query handles caching with 5-minute stale time
- **Error Handling**: Comprehensive error handling with retry functionality
- **Loading States**: Built-in loading states for better UX
- **Type Safety**: Full TypeScript support with proper types
- **DevTools**: Zustand DevTools integration for debugging
- **Optimistic Updates**: Store supports optimistic updates for better UX 