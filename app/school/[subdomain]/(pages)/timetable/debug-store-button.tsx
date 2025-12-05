'use client';

import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { Button } from '@/components/ui/button';

export function DebugStoreButton() {
  const store = useTimetableStore();

  const handleDebug = () => {
    console.log('=== TIMETABLE STORE DEBUG ===');
    console.log('Grades:', store.grades.length, store.grades);
    console.log('Subjects:', store.subjects.length, store.subjects);
    console.log('Teachers:', store.teachers.length, store.teachers);
    console.log('TimeSlots:', store.timeSlots.length, store.timeSlots);
    console.log('Breaks:', store.breaks.length, store.breaks);
    console.log('Entries:', store.entries.length, store.entries);
    console.log('Selected Grade ID:', store.selectedGradeId);
    console.log('Last Updated:', store.lastUpdated);
    
    alert(`
Store Status:
- Grades: ${store.grades.length}
- Subjects: ${store.subjects.length}
- Teachers: ${store.teachers.length}
- TimeSlots: ${store.timeSlots.length}
- Breaks: ${store.breaks.length}
- Entries: ${store.entries.length}
- Selected Grade: ${store.selectedGradeId}
    `);
  };

  const handleReloadTimeSlots = async () => {
    try {
      console.log('Reloading time slots from backend...');
      // Try to get termId from store state
      const termId = store.selectedTermId;
      await store.loadTimeSlots(termId || undefined);
      alert('Time slots reloaded from backend!');
    } catch (error) {
      console.error('Failed to reload time slots:', error);
      alert(`Failed to reload time slots: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleClearLocalStorage = () => {
    if (confirm('This will clear the timetable cache. Continue?')) {
      localStorage.removeItem('timetable-store-v2');
      alert('Cache cleared! Refresh the page.');
      window.location.reload();
    }
  };

  return (
    <div className="flex gap-2">
      <Button onClick={handleDebug} variant="outline" size="sm">
        🐛 Debug Store
      </Button>
      <Button onClick={handleReloadTimeSlots} variant="outline" size="sm">
        🔄 Reload Time Slots
      </Button>
      <Button onClick={handleClearLocalStorage} variant="destructive" size="sm">
        🗑️ Clear Cache
      </Button>
    </div>
  );
}

