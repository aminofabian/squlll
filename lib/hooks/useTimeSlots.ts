import { useState } from 'react';

export interface TimeSlotInput {
  periodNumber: number;
  displayTime: string;
  startTime: string;
  endTime: string;
  color: string;
}

export interface CreateTimeSlotsResponse {
  data: {
    [key: string]: {
      id: string;
      periodNumber: number;
      displayTime?: string;
      startTime?: string;
      endTime?: string;
      color?: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export interface UpdateTimeSlotInput {
  id: string;
  periodNumber?: number;
  displayTime?: string;
  startTime?: string;
  endTime?: string;
  color?: string;
}

export interface UpdateTimeSlotResponse {
  data: {
    updateTimeSlot: {
      id: string;
      periodNumber: number;
      displayTime: string;
      startTime: string;
      endTime: string;
      color: string;
    };
  };
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export interface GetTimeSlotsResponse {
  data: {
    getTimeSlots: Array<{
      id: string;
      periodNumber: number;
      displayTime: string;
      startTime: string;
      endTime: string;
      color: string;
    }>;
  };
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

export function useTimeSlots() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTimeSlots = async (timeSlots: TimeSlotInput[]): Promise<CreateTimeSlotsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/school/time-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(timeSlots),
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
      if (!result.data) {
        throw new Error('Invalid response format: missing data');
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

  const createTimeSlot = async (timeSlot: TimeSlotInput): Promise<CreateTimeSlotsResponse> => {
    return createTimeSlots([timeSlot]);
  };

  const updateTimeSlot = async (updateData: UpdateTimeSlotInput): Promise<UpdateTimeSlotResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/school/time-slot', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
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
      if (!result.data || !result.data.updateTimeSlot) {
        throw new Error('Invalid response format: missing updateTimeSlot data');
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

  const getTimeSlots = async (): Promise<GetTimeSlotsResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/school/time-slot', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
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
      if (!result.data || !result.data.getTimeSlots) {
        throw new Error('Invalid response format: missing getTimeSlots data');
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
    createTimeSlots,
    createTimeSlot,
    updateTimeSlot,
    getTimeSlots,
    loading,
    error,
  };
}