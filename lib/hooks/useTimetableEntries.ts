import { useState } from 'react';

export interface BulkCreateEntryInput {
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;
  roomNumber?: string;
}

export interface BulkCreateEntriesRequest {
  termId: string;
  gradeId: string;
  entries: BulkCreateEntryInput[];
}

export interface BulkCreateEntriesResponse {
  data: {
    bulkCreateTimetableEntries: Array<{
      id: string;
      dayOfWeek: number;
      timeSlot: {
        periodNumber: number;
      };
      subject: {
        name: string;
      };
    }>;
  };
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export function useTimetableEntries() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreateEntries = async (
    request: BulkCreateEntriesRequest
  ): Promise<BulkCreateEntriesResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/school/timetable/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Check response status before trying to parse JSON
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Request failed: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      // Safely parse JSON response
      let result;
      try {
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Expected JSON response, got ${contentType || 'unknown content type'}: ${text.substring(0, 200)}`);
        }

        result = await response.json();
      } catch (parseError) {
        const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error';
        throw new Error(`Failed to parse response: ${errorMessage}`);
      }

      // Check for GraphQL errors
      if (result.errors) {
        const errorMessages = result.errors.map((e: any) => e.message).join(', ');
        throw new Error(`GraphQL errors: ${errorMessages}`);
      }

      // Ensure we have the expected data structure
      if (!result.data || !result.data.bulkCreateTimetableEntries) {
        throw new Error('Invalid response format: missing bulkCreateTimetableEntries data');
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    bulkCreateEntries,
    loading,
    error,
  };
}

