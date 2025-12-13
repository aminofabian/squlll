# Week Template Manager - Integration Guide

## Quick Integration

To add the Week Template Manager to your timetable page, follow these simple steps:

### Option 1: Add as a Tab or Section

Add it as a new tab in your existing timetable interface:

```tsx
// In app/school/[subdomain]/(pages)/timetable/page.tsx

import { WeekTemplateManager } from './components/WeekTemplateManager';

export default function SmartTimetableNew() {
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule' | 'templates' | 'settings'
  
  return (
    <div>
      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="templates">Week Templates</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedule">
          {/* Your existing timetable grid */}
        </TabsContent>
        
        <TabsContent value="templates">
          <WeekTemplateManager />
        </TabsContent>
        
        <TabsContent value="settings">
          {/* Settings content */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Option 2: Add as a Modal/Sheet

Add it as a modal that can be opened from a button:

```tsx
import { WeekTemplateManager } from './components/WeekTemplateManager';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Calendar } from 'lucide-react';

export default function SmartTimetableNew() {
  return (
    <div>
      {/* Your existing timetable UI */}
      
      {/* Add button to toolbar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[600px] overflow-y-auto">
          <WeekTemplateManager />
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

### Option 3: Add as a Separate Page

Create a dedicated page for template management:

```tsx
// app/school/[subdomain]/(pages)/templates/page.tsx

import { WeekTemplateManager } from '../timetable/components/WeekTemplateManager';

export default function TemplatesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Week Template Management</h1>
      <WeekTemplateManager />
    </div>
  );
}
```

---

## Testing the Integration

### 1. Test with the Script

First, make sure your backend is working:

```bash
# Start your dev server
npm run dev

# In another terminal, run the test script
node test-week-templates.js

# If you have templates, try the update/rebuild tests
node test-week-templates.js --update
node test-week-templates.js --rebuild
```

### 2. Test in the UI

1. Navigate to where you added the WeekTemplateManager component
2. Click "Load Templates (Basic)" - should show list of templates
3. Click "Load Templates (Full Details)" - should show detailed structure
4. Click "Update Time" on a template - should update and show new times
5. Click "Rebuild Periods" - should handle safely (with force confirmation if needed)

---

## Customization Options

### Custom Styling

```tsx
<WeekTemplateManager 
  className="custom-class"
  // Add custom props as needed
/>
```

### Integration with Existing State

If you want to sync with your existing timetable state:

```tsx
import { WeekTemplateManager } from './components/WeekTemplateManager';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';

export default function SmartTimetableNew() {
  const { loadSchoolTimetable } = useTimetableStore();
  
  const handleTemplateUpdated = async () => {
    // Reload timetable when template changes
    await loadSchoolTimetable(selectedTermId);
  };
  
  return (
    <WeekTemplateManager 
      onTemplateUpdated={handleTemplateUpdated}
    />
  );
}
```

---

## Common Integration Patterns

### Pattern 1: Settings Panel

Add to an existing settings/configuration panel:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Timetable Configuration</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Other settings */}
    <div className="border-t pt-4 mt-4">
      <WeekTemplateManager />
    </div>
  </CardContent>
</Card>
```

### Pattern 2: Dashboard Widget

Add as a widget on an admin dashboard:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Other dashboard widgets */}
  <div className="col-span-2">
    <WeekTemplateManager />
  </div>
</div>
```

### Pattern 3: Setup Wizard

Include in a school setup wizard:

```tsx
<Stepper currentStep={3}>
  <Step title="School Info">...</Step>
  <Step title="Grade Levels">...</Step>
  <Step title="Week Template">
    <WeekTemplateManager />
  </Step>
  <Step title="Subjects">...</Step>
</Stepper>
```

---

## API Integration Examples

### Load and Display Templates in Custom UI

```tsx
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';

function CustomTemplateList() {
  const { loadWeekTemplates } = useTimetableStore();
  const [templates, setTemplates] = useState([]);
  
  useEffect(() => {
    loadWeekTemplates(false).then(setTemplates);
  }, []);
  
  return (
    <div>
      {templates.map(template => (
        <div key={template.id}>
          <h3>{template.name}</h3>
          <p>{template.numberOfDays} days</p>
        </div>
      ))}
    </div>
  );
}
```

### Custom Update Form

```tsx
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { useToast } from '@/components/ui/use-toast';

function QuickTimeUpdate({ templateId }) {
  const { updateWeekTemplate } = useTimetableStore();
  const { toast } = useToast();
  const [newTime, setNewTime] = useState('08:00');
  
  const handleUpdate = async () => {
    try {
      await updateWeekTemplate({
        id: templateId,
        defaultStartTime: newTime,
      });
      toast({ title: 'Success', description: 'Start time updated' });
    } catch (error) {
      toast({ 
        title: 'Error', 
        description: error.message,
        variant: 'destructive' 
      });
    }
  };
  
  return (
    <div className="flex gap-2">
      <Input 
        type="time" 
        value={newTime}
        onChange={(e) => setNewTime(e.target.value)}
      />
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
}
```

### Custom Rebuild Confirmation

```tsx
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

function SafeRebuildButton({ templateId, ...rebuildParams }) {
  const { rebuildWeekTemplatePeriods } = useTimetableStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const [needsForce, setNeedsForce] = useState(false);
  
  const handleRebuild = async (force = false) => {
    try {
      await rebuildWeekTemplatePeriods({
        id: templateId,
        ...rebuildParams,
        force,
      });
      setShowConfirm(false);
    } catch (error) {
      if (error.message.includes('timetable entries exist')) {
        setNeedsForce(true);
        setShowConfirm(true);
      } else {
        throw error;
      }
    }
  };
  
  return (
    <>
      <Button onClick={() => handleRebuild(false)}>
        Rebuild Periods
      </Button>
      
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rebuild</AlertDialogTitle>
            <AlertDialogDescription>
              {needsForce 
                ? 'Timetable entries exist. This will DELETE them. Continue?'
                : 'This will rebuild all periods. Continue?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleRebuild(needsForce)}
              className={needsForce ? 'bg-destructive' : ''}
            >
              {needsForce ? 'Delete & Rebuild' : 'Rebuild'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

---

## Performance Considerations

### 1. Lazy Loading

Load the component only when needed:

```tsx
import dynamic from 'next/dynamic';

const WeekTemplateManager = dynamic(
  () => import('./components/WeekTemplateManager').then(mod => ({ 
    default: mod.WeekTemplateManager 
  })),
  { ssr: false }
);
```

### 2. Caching

Cache template data to avoid unnecessary reloads:

```tsx
import useSWR from 'swr';

function CachedTemplateManager() {
  const { loadWeekTemplates } = useTimetableStore();
  
  const { data: templates, mutate } = useSWR(
    'week-templates',
    () => loadWeekTemplates(false),
    { revalidateOnFocus: false }
  );
  
  const handleUpdate = async (id, startTime) => {
    await updateWeekTemplate({ id, defaultStartTime: startTime });
    mutate(); // Refresh cache
  };
  
  // ... render UI
}
```

### 3. Optimistic Updates

Update UI immediately before backend confirms:

```tsx
const handleQuickUpdate = async (templateId, newTime) => {
  // Update UI immediately
  setTemplates(prev => prev.map(t => 
    t.id === templateId 
      ? { ...t, dayTemplates: t.dayTemplates.map(d => ({...d, startTime: newTime}))}
      : t
  ));
  
  try {
    // Then sync with backend
    await updateWeekTemplate({ id: templateId, defaultStartTime: newTime });
  } catch (error) {
    // Revert on error
    await loadWeekTemplates(true).then(setTemplates);
    toast({ title: 'Error', description: error.message, variant: 'destructive' });
  }
};
```

---

## Security Considerations

### 1. Role-Based Access

Restrict template management to admins:

```tsx
import { useSession } from 'next-auth/react';

function ProtectedTemplateManager() {
  const { data: session } = useSession();
  
  if (session?.user?.role !== 'ADMIN') {
    return <div>Access denied. Admin only.</div>;
  }
  
  return <WeekTemplateManager />;
}
```

### 2. Confirmation for Destructive Actions

Always confirm before force rebuild:

```tsx
const handleForceRebuild = async () => {
  const confirmed = window.confirm(
    'This will permanently delete all timetable entries. Are you absolutely sure?'
  );
  
  if (!confirmed) return;
  
  const doubleConfirm = window.confirm(
    'This cannot be undone. Type "DELETE" to confirm.'
  );
  
  if (!doubleConfirm) return;
  
  await rebuildWeekTemplatePeriods({ ...params, force: true });
};
```

---

## Monitoring and Logging

### Track Template Changes

```tsx
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';

function MonitoredTemplateManager() {
  const { updateWeekTemplate, rebuildWeekTemplatePeriods } = useTimetableStore();
  
  const loggedUpdate = async (input) => {
    console.log('Updating template:', input);
    const startTime = Date.now();
    
    try {
      const result = await updateWeekTemplate(input);
      console.log('Update successful in', Date.now() - startTime, 'ms');
      
      // Optional: Send to analytics
      analytics.track('template_updated', {
        templateId: input.id,
        newStartTime: input.defaultStartTime,
        duration: Date.now() - startTime,
      });
      
      return result;
    } catch (error) {
      console.error('Update failed:', error);
      // Optional: Send to error tracking
      errorTracking.captureException(error);
      throw error;
    }
  };
  
  return <WeekTemplateManager />;
}
```

---

## Next Steps

1. **Choose Integration Method**: Pick the option that best fits your UI
2. **Test Thoroughly**: Use the test script to verify backend functionality
3. **Add Role Checks**: Ensure only authorized users can modify templates
4. **Monitor Usage**: Track how templates are being used and modified
5. **Document Changes**: Keep audit logs of template modifications

---

## Troubleshooting

### Component Not Showing
- Check import paths
- Verify store is properly initialized
- Check for console errors

### Queries Failing
- Verify GraphQL endpoint is accessible
- Check authentication cookies
- Review backend logs for errors

### UI Not Updating
- Ensure you're reloading templates after mutations
- Check React DevTools for state changes
- Verify store updates are triggering re-renders

---

## Support

For issues or questions:
1. Check the [Week Template Guide](./WEEK_TEMPLATE_GUIDE.md) for API details
2. Run the test script to isolate backend vs frontend issues
3. Review browser console and network tab for errors
4. Check backend logs for GraphQL errors

