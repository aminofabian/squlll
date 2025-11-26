# 🐛 Timetable Not Showing Data - Debug Guide

## Problem
Your timetable page is blank or showing "No data".

## Most Likely Cause
The Zustand store is **persisting empty data to localStorage** on the first load, then loading that empty cache instead of the mock data.

---

## 🔧 **Quick Fix - 3 Steps**

### **Step 1: Open Your Timetable Page**
Navigate to `/school/[subdomain]/timetable` in your browser.

### **Step 2: Click "🗑️ Clear Cache"**
You'll see a yellow debug panel at the top with 3 buttons:
- 🐛 Debug Store
- 🔄 Reload Mock Data  
- 🗑️ **Clear Cache** ← Click this one

This will:
1. Remove the cached (empty) data from localStorage
2. Refresh the page
3. Load fresh mock data

### **Step 3: Verify Data Loaded**
After the page refreshes, click **"🐛 Debug Store"** to see:
```
Store Status:
- Grades: 14
- Subjects: 30+
- Teachers: 20+
- TimeSlots: 11
- Breaks: 15
- Entries: 1000+
```

If all numbers are **> 0**, you're good! ✅

---

## 🔍 **Alternative: Manual Fix (Browser Console)**

If the buttons don't work, open browser console (F12) and run:

```javascript
// Clear the timetable cache
localStorage.removeItem('timetable-store-v2');

// Reload the page
location.reload();
```

---

## 🤔 **Why Does This Happen?**

Your store code:
```typescript
export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      // Initial data from transformed mock data
      ...transformedMockData, // ← This loads mock data
      
      // ...
    }),
    {
      name: 'timetable-store-v2',
      storage: createJSONStorage(() => localStorage), // ← But this caches it
    }
  )
);
```

**What happens**:
1. First load: `transformedMockData` is loaded ✅
2. Zustand immediately saves to localStorage under key `timetable-store-v2` ✅
3. **Second load**: Zustand finds cached data in localStorage
4. Zustand **uses cached data instead of fresh mock data** ❌

If the initial load failed (import error, transformation error), **empty data gets cached**.

---

## 🎯 **Permanent Fix Options**

### **Option 1: Add Hydration Check** (Recommended)

Update your store to detect empty state:

```typescript
export const useTimetableStore = create<TimetableStore>()(
  persist(
    (set, get) => ({
      ...transformedMockData,
      // ... other state
    }),
    {
      name: 'timetable-store-v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // If rehydrated state is empty, reload mock data
        if (state && state.grades.length === 0) {
          console.warn('Empty state detected, reloading mock data');
          state.loadMockData();
        }
      },
    }
  )
);
```

### **Option 2: Version Your Cache**

When you update mock data, change the storage key:

```typescript
{
  name: 'timetable-store-v3', // ← Change version number
  storage: createJSONStorage(() => localStorage),
}
```

This forces all clients to reload fresh data.

### **Option 3: Don't Persist Mock Data** (Development Only)

For development, you can disable persistence:

```typescript
// Development: No persistence
export const useTimetableStore = create<TimetableStore>()(
  (set, get) => ({
    ...transformedMockData,
    // ... state
  })
);

// Production: Use persistence
// (when connected to real API)
```

---

## 📊 **Debugging Checklist**

Use the **"🐛 Debug Store"** button to check:

| Item | Expected | Problem If... |
|------|----------|---------------|
| Grades | 14 | 0 = Mock data not loaded |
| Subjects | 30+ | 0 = Transformation failed |
| Teachers | 20+ | 0 = Import failed |
| TimeSlots | 11 | 0 = Mock data missing metadata |
| Breaks | 15 | 0 = Transform didn't generate breaks |
| Entries | 1000+ | 0 = **Main problem** - timetable is empty |
| Selected Grade | `grade-1` | `null` = No default selected |

---

## 🚨 **Common Issues**

### **Issue 1: Import Error**
```typescript
import mockData from './mock-timetable-data.json';
```

**Check**:
- Does `mock-timetable-data.json` exist?
- Is it valid JSON?
- Is it in the correct location?

### **Issue 2: Transformation Error**
```typescript
export function transformMockData(): TimetableData {
  // If this throws an error, empty data is returned
}
```

**Check**:
- Open browser console for errors
- Look for "TypeError" or "Cannot read property"

### **Issue 3: Persistence Bug**
- Old cached data from previous version
- Solution: Clear cache or bump version number

---

## ✅ **Verification Steps**

After clearing cache:

1. **Refresh page** - You should see data immediately
2. **Check grade dropdown** - Should show 14 grades (PP1, PP2, Grade 1-12)
3. **Check timetable grid** - Should show 11 periods × 5 days
4. **Check statistics** - Should show ~50 lessons, conflicts, etc.
5. **Try editing a lesson** - Click any cell to open edit dialog

If all these work, your timetable is functioning correctly! 🎉

---

## 📝 **Summary**

**Problem**: Empty data cached in localStorage  
**Quick Fix**: Click "🗑️ Clear Cache" button  
**Permanent Fix**: Add hydration check or version cache key  

**The debug buttons will stay in your UI until you remove them** - they're helpful for development!

