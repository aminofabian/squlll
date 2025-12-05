import { useState, useEffect } from 'react';

export interface TimeSlot {
  id: string;
  periodNumber: number;
  displayTime: string;
}

export interface BreakData {
  id: string;
  name: string;
  type: string;
  icon: string;
  durationMinutes: number;
}

export interface EntryData {
  id: string;
  roomNumber: string;
  subject: {
    name: string;
  };
  teacher: {
    user: {
      name: string;
    } | null;
  };
}

export interface TimetableCell {
  dayOfWeek: number;
  periodNumber: number;
  isBreak: boolean;
  breakData: BreakData | null;
  entryData: EntryData | null;
}

export interface CompleteTimetable {
  gradeId: string;
  gradeName: string;
  timeSlots: TimeSlot[];
  cells: TimetableCell[];
}

interface UseStudentTimetableResult {
  timetable: CompleteTimetable | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook to fetch complete timetable for a student's grade
 */
export function useStudentTimetable(
  termId: string | null,
  gradeId: string | null
): UseStudentTimetableResult {
  const [timetable, setTimetable] = useState<CompleteTimetable | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTimetable = async () => {
    if (!termId || !gradeId) {
      setTimetable(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          query: `
            query GetCompleteTimetable($termId: ID!, $gradeId: ID!) {
              getCompleteTimetable(termId: $termId, gradeId: $gradeId) {
                gradeId
                gradeName
                timeSlots {
                  id
                  periodNumber
                  displayTime
                }
                cells {
                  dayOfWeek
                  periodNumber
                  isBreak
                  breakData {
                    id
                    name
                    type
                    icon
                    durationMinutes
                  }
                  entryData {
                    id
                    roomNumber
                    subject {
                      name
                    }
                    teacher {
                      user {
                        name
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: {
            termId,
            gradeId,
          },
        }),
      });

      const data = await response.json();

      if (data.errors) {
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      if (!data.data?.getCompleteTimetable) {
        throw new Error('No timetable data returned');
      }

      setTimetable(data.data.getCompleteTimetable);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch timetable';
      setError(errorMessage);
      console.error('Error fetching student timetable:', err);
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimetable();
  }, [termId, gradeId]);

  return {
    timetable,
    loading,
    error,
    refetch: fetchTimetable,
  };
}

