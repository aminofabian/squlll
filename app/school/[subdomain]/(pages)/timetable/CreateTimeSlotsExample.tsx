'use client'

import { useState } from 'react';
import { useTimeSlots } from '@/lib/hooks/useTimeSlots';
import { useTimetableStore } from '@/lib/stores/useTimetableStoreNew';
import { TimeSlotInput } from '@/lib/hooks/useTimeSlots';
import { useToast } from '@/components/ui/use-toast';

export function CreateTimeSlotsExample() {
  const { createTimeSlots, loading, error } = useTimeSlots();
  const { createTimeSlots: createStoreTimeSlots } = useTimetableStore();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);

  // Example time slots matching your mutation
  const exampleTimeSlots: TimeSlotInput[] = [
    {
      periodNumber: 4,
      displayTime: "10:15 AM – 11:30 AM",
      startTime: "11:30",
      endTime: "10:15",
      color: "#3B82F6"
    },
    {
      periodNumber: 2,
      displayTime: "8:45 AM – 9:30 AM",
      startTime: "08:45",
      endTime: "09:30",
      color: "#10B981"
    },
    {
      periodNumber: 3,
      displayTime: "9:30 AM – 10:15 AM",
      startTime: "09:30",
      endTime: "10:15",
      color: "#F59E0B"
    }
  ];

  const handleCreateTimeSlots = async () => {
    try {
      console.log('Creating time slots with:', exampleTimeSlots);

      // Option 1: Using the hook directly
      const result = await createTimeSlots(exampleTimeSlots);
      setResults(result);
      console.log('Direct hook result:', result);

      // Option 2: Using the store (will also update local state)
      await createStoreTimeSlots(exampleTimeSlots);
      console.log('Store updated successfully');

      // Show success toast
      toast({
        title: 'Time slots created successfully!',
        description: `Successfully created ${exampleTimeSlots.length} time slot${exampleTimeSlots.length !== 1 ? 's' : ''}.`,
        variant: 'success',
      });

    } catch (error) {
      console.error('Error creating time slots:', error);
      setResults({ error: error instanceof Error ? error.message : 'Unknown error' });
      
      // Show error toast
      toast({
        title: 'Failed to create time slots',
        description: error instanceof Error ? error.message : 'An error occurred while creating time slots.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Create Time Slots Example</h2>

      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <h3 className="font-semibold mb-2">Time Slots to Create:</h3>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto">
          {JSON.stringify(exampleTimeSlots, null, 2)}
        </pre>
      </div>

      <button
        onClick={handleCreateTimeSlots}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed mb-4"
      >
        {loading ? 'Creating...' : 'Create Time Slots'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded mb-4">
          Error: {error}
        </div>
      )}

      {results && (
        <div className="bg-green-50 border border-green-200 p-4 rounded">
          <h3 className="font-semibold mb-2">Results:</h3>
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-600">
        <p><strong>Note:</strong> This requires the external GraphQL API to have the <code>createTimeSlot</code> mutation implemented.</p>
        <p>The mutation structure being sent:</p>
        <pre className="bg-gray-100 p-2 rounded mt-2">
{`mutation CreateTimeSlots {
  slot1: createTimeSlot(input: {
    periodNumber: 4
    displayTime: "10:15 AM – 11:30 AM"
    startTime: "11:30"
    endTime: "10:15"
    color: "#3B82F6"
  }) {
    id
    periodNumber
    displayTime
  }
  // ... more slots
}`}
        </pre>
      </div>
    </div>
  );
}