# School Layout Components

This directory contains the refactored layout components for the school management system.

## Components

### `SchoolNavbar.tsx`
The main navigation bar component that was extracted from the layout. It includes:
- Mobile sidebar toggle button
- Desktop sidebar minimize/expand toggle
- Terms dropdown
- Progress indicator
- "New" dropdown menu for creating items
- Notifications dropdown
- User profile dropdown

**Props:**
- `userName: string` - The current user's name
- `userRole: string` - The current user's role
- `isSidebarMinimized: boolean` - Whether the sidebar is minimized
- `isMobileSidebarOpen: boolean` - Whether the mobile sidebar is open
- `onToggleMobileSidebar: () => void` - Handler for mobile sidebar toggle
- `onToggleSidebarMinimize: () => void` - Handler for sidebar minimize toggle

### Usage Example

```tsx
<SchoolNavbar
  userName={userName}
  userRole={userRole}
  isSidebarMinimized={isSidebarMinimized}
  isMobileSidebarOpen={isMobileSidebarOpen}
  onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
  onToggleSidebarMinimize={() => setIsSidebarMinimized(!isSidebarMinimized)}
/>
```

## Benefits of Refactoring

1. **Separation of Concerns**: The navbar is now a standalone component
2. **Reusability**: Can be used in other layouts if needed
3. **Maintainability**: Easier to modify navbar functionality without touching the main layout
4. **Testing**: Can be unit tested independently
5. **Code Organization**: Cleaner, more organized codebase

## File Structure

```
app/school/[subdomain]/(pages)/
├── layout.tsx              # Main layout (simplified)
├── components/
│   ├── SchoolNavbar.tsx    # Extracted navbar component
│   ├── TermsDropdown.tsx   # Terms dropdown component
│   └── README.md           # This file
└── contexts/
    └── TermContext.tsx     # Term context provider
```
