# 🔄 Toggle View: Fee Records ↔️ Fee Assignments

## What Changed

Instead of having 3 separate tabs, the Invoice Management tab now has a **toggle button** that switches between two views:

1. **Fee Records** - Your existing invoice/payment tracking system
2. **Fee Assignments** - The new fee structure assignments view

---

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ Fees Management                                        [Settings]    │
├─────────────────────────────────────────────────────────────────────┤
│ [Invoice Management]                    [Fee Structures]            │
└─────────────────────────────────────────────────────────────────────┘

When "Invoice Management" is selected:

┌─────────────────────────────────────────────────────────────────────┐
│ [Fee Records] [Fee Assignments]    View student invoices and pay... │
└─────────────────────────────────────────────────────────────────────┘
     ↑ Active       ↑ Inactive

OR

┌─────────────────────────────────────────────────────────────────────┐
│ [Fee Records] [Fee Assignments]    View fee structure assignments..│
└─────────────────────────────────────────────────────────────────────┘
   ↑ Inactive       ↑ Active
```

---

## How It Works

### **Fee Records View (Default)**
- Shows the **student sidebar** on the left
- Shows **invoice tables**, **payment tracking**, **statistics**
- All your existing functionality remains the same

### **Fee Assignments View**
- **Hides the student sidebar** (not needed for assignments)
- Shows the **expandable assignments table**
- Full width layout for better data visibility
- Shows which fee structures are assigned to which students

---

## Toggle Button Behavior

| Button | Active State | Inactive State |
|--------|--------------|----------------|
| **Fee Records** | Solid background (primary) | Outline only |
| **Fee Assignments** | Solid background (primary) | Outline only |

**Active button** = `variant="default"` (filled)  
**Inactive button** = `variant="outline"` (border only)

---

## Layout Changes

### When "Fee Records" is Active:
```
┌─────────────┬──────────────────────────────────────────┐
│  Student    │                                          │
│  Sidebar    │  Invoice Tables, Stats, Filters          │
│             │  (Your existing content)                 │
│             │                                          │
└─────────────┴──────────────────────────────────────────┘
```

### When "Fee Assignments" is Active:
```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│  Fee Assignments Table (Full Width)                     │
│  - Expandable rows                                      │
│  - Summary statistics                                   │
│  - Refresh/Export buttons                               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## User Flow

1. **User clicks "Invoice Management" tab**
   - Default view: Fee Records (your existing invoices table)

2. **User clicks "Fee Assignments" button**
   - Sidebar disappears
   - Content switches to Fee Assignments table
   - Helper text updates

3. **User clicks "Fee Records" button**
   - Sidebar reappears
   - Content switches back to invoices
   - Helper text updates

---

## Why This Makes Sense

### ✅ **Semantic Grouping**
Both views are about **viewing fee-related data**:
- Records = "What's been invoiced/paid"
- Assignments = "What fee structures are assigned"

### ✅ **Cleaner UI**
- Only 2 main tabs instead of 3
- Toggle is contextual (only shows in Invoice Management)
- Less navigation depth

### ✅ **Better Space Usage**
- Fee Assignments gets full width (no sidebar needed)
- Fee Records keeps sidebar (for student search)

### ✅ **Logical Flow**
1. Define fee structures (Fee Structures tab)
2. Assign them to students (Fee Assignments view)
3. Generate and track invoices (Fee Records view)

---

## Helper Text

The helper text on the right side of the toggle updates based on the view:

- **Fee Records**: "View student invoices and payment status"
- **Fee Assignments**: "View fee structure assignments to students"

This provides immediate context about what the user is viewing.

---

## Code Summary

### State Added:
```tsx
const [invoiceView, setInvoiceView] = useState<'records' | 'assignments'>('records')
```

### Toggle Button:
```tsx
<Button
  variant={invoiceView === 'records' ? 'default' : 'outline'}
  onClick={() => setInvoiceView('records')}
>
  Fee Records
</Button>
<Button
  variant={invoiceView === 'assignments' ? 'default' : 'outline'}
  onClick={() => setInvoiceView('assignments')}
>
  Fee Assignments
</Button>
```

### Conditional Rendering:
```tsx
{invoiceView === 'records' ? (
  // Your existing invoice management content
) : (
  // Fee Assignments View
)}
```

---

## Testing

1. Navigate to Fees Management page
2. Click **"Invoice Management"** tab (default)
3. See toggle buttons at the top: **[Fee Records] [Fee Assignments]**
4. Click **"Fee Assignments"**
   - Sidebar disappears
   - Assignments table appears
5. Click **"Fee Records"**
   - Sidebar reappears
   - Invoice tables appear

---

## Styling

- ✅ Font-mono for consistency
- ✅ Proper spacing (px-6 py-3)
- ✅ Border separation (border-b)
- ✅ Clear visual hierarchy
- ✅ Accessible (proper contrast, clear states)

---

**Result:** A cleaner, more intuitive interface that groups related functionality together! 🎉

