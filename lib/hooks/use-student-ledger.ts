import { useState, useEffect } from 'react';
import { useHandleGraphQLError } from './useGraphQLErrorHandler';

interface DateRangeInput {
  startDate: string;
  endDate: string;
}

interface UseStudentLedgerProps {
  studentId: string;
  dateRange: DateRangeInput;
  skip?: boolean;
}

interface UseStudentLedgerResult {
  ledgerData: any | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStudentLedger({ studentId, dateRange, skip = false }: UseStudentLedgerProps): UseStudentLedgerResult {
  const [ledgerData, setLedgerData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useHandleGraphQLError();

  const fetchStudentLedger = async () => {
    if (skip || !studentId) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('=== useStudentLedger Debug ===');
      console.log('Student ID:', studentId);
      console.log('Date Range:', dateRange);
      console.log('Making GraphQL request to /api/graphql');

      // First try the studentLedger query
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetStudentLedger($studentId: ID!, $dateRange: DateRangeInput!) {
              studentLedger(studentId: $studentId, dateRange: $dateRange) {
                studentId
                student {
                  admission_number
                  user {
                    name
                    email
                  }
                  grade {
                    shortName
                  }
                }
                entries {
                  date
                  description
                  reference
                  debit
                  credit
                  balance
                  invoiceNumber
                  receiptNumber
                }
                summary {
                  totalInvoiced
                  totalPaid
                  totalBalance
                  invoiceCount
                  paymentCount
                  lastPaymentDate
                  averagePaymentAmount
                }
                generatedAt
                dateRangeStart
                dateRangeEnd
              }
            }
          `,
          variables: {
            studentId,
            dateRange
          },
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        
        // If it's a 500 error, the studentLedger query doesn't exist yet
        if (response.status === 500) {
          console.log('studentLedger query not available, falling back to studentSummary');
          await fetchStudentSummary();
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Raw GraphQL response:', data);

      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
        
        // Check if it's an authentication error first
        if (handleError(data)) {
          return; // Error was handled by redirecting to login
        }
        
        // Check if it's a "field doesn't exist" error
        const hasFieldError = data.errors.some((error: any) => 
          error.message?.includes('Cannot query field "studentLedger"') ||
          error.message?.includes('Unknown field')
        );
        
        if (hasFieldError) {
          console.log('studentLedger field not found, falling back to studentSummary');
          await fetchStudentSummary();
          return;
        }
        
        throw new Error(data.errors.map((e: any) => e.message).join(', '));
      }

      const ledger = data.data?.studentLedger;
      
      if (ledger) {
        setLedgerData(ledger);
        console.log('Ledger data set:', ledger);
      } else {
        throw new Error('No ledger data received');
      }
    } catch (err) {
      console.error('Error fetching student ledger:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student ledger');
    } finally {
      setLoading(false);
    }
  };

  // Fallback function to get basic student financial data
  const fetchStudentSummary = async () => {
    try {
      console.log('Fetching student summary as fallback...');
      
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetStudentSummary($studentId: ID!) {
              studentSummary(studentId: $studentId) {
                id
                admissionNumber
                studentName
                email
                phone
                gender
                schoolType
                gradeLevelName
                curriculumName
                streamName
                feeSummary {
                  totalOwed
                  totalPaid
                  balance
                  numberOfFeeItems
                  feeItems {
                    id
                    feeBucketName
                    amount
                    isMandatory
                    feeStructureName
                    academicYearName
                  }
                }
                isActive
                createdAt
                updatedAt
              }
            }
          `,
          variables: {
            studentId,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.errors) {
        // Check if it's an authentication error first
        if (handleError(data)) {
          return; // Error was handled by redirecting to login
        }
        
        throw new Error(data.errors[0]?.message || 'GraphQL error');
      }

      const student = data.data?.studentSummary;
      
      if (student) {
        // Debug: Log the raw fee summary data
        console.log('Raw student fee summary:', {
          totalOwed: student.feeSummary.totalOwed,
          totalPaid: student.feeSummary.totalPaid,
          balance: student.feeSummary.balance,
          numberOfFeeItems: student.feeSummary.numberOfFeeItems
        });
        
        // Calculate balance correctly
        const calculatedBalance = student.feeSummary.totalOwed - student.feeSummary.totalPaid;
        console.log('Calculated balance:', calculatedBalance);
        
        // Transform studentSummary data to match ledger format
        const transformedData = {
          studentId: student.id,
          student: {
            admission_number: student.admissionNumber,
            user: {
              name: student.studentName,
              email: student.email
            },
            grade: {
              shortName: student.gradeLevelName
            }
          },
          entries: [], // No transaction history available
          summary: {
            totalInvoiced: student.feeSummary.totalOwed,
            totalPaid: student.feeSummary.totalPaid,
            totalBalance: calculatedBalance, // Use calculated balance
            invoiceCount: student.feeSummary.numberOfFeeItems,
            paymentCount: 0, // Not available in summary
            lastPaymentDate: null, // Not available in summary
            averagePaymentAmount: student.feeSummary.totalPaid / Math.max(student.feeSummary.numberOfFeeItems, 1)
          },
          generatedAt: new Date().toISOString(),
          dateRangeStart: dateRange.startDate + "T00:00:00.000Z",
          dateRangeEnd: dateRange.endDate + "T23:59:59.999Z",
          isFallbackData: true // Flag to indicate this is fallback data
        };
        
        setLedgerData(transformedData);
        console.log('Fallback ledger data set:', transformedData);
      } else {
        throw new Error('Student not found');
      }
    } catch (err) {
      console.error('Error fetching student summary:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch student data');
    }
  };

  useEffect(() => {
    fetchStudentLedger();
  }, [studentId, dateRange.startDate, dateRange.endDate]);

  return {
    ledgerData,
    loading,
    error,
    refetch: fetchStudentLedger
  };
}
