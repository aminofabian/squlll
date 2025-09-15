'use client'

import { TermsManager } from './TermsManager'

/**
 * Example component showing how to use TermsManager with a specific academic year ID
 * This demonstrates the usage pattern requested in the original query
 */
export function ExampleTermsUsage() {
  return (
    <div className="space-y-6">
      {/* Example 1: Using with a specific academic year ID (as requested) */}
      <TermsManager 
        academicYearId="18abe02a-9bc9-4d90-9bcc-335a53242fc4" 
        className="border-2 border-primary/20 rounded-xl"
      />
      
      {/* Example 2: Using without academic year ID (will use current academic year) */}
      <TermsManager 
        className="border-2 border-primary/20 rounded-xl"
      />
    </div>
  )
}

/**
 * Usage Notes:
 * 
 * 1. The component automatically queries terms using the GraphQL query:
 *    query GetTermsForAcademicYear {
 *      termsByAcademicYear(academicYearId: "18abe02a-9bc9-4d90-9bcc-335a53242fc4") {
 *        id
 *        name
 *        startDate
 *        endDate
 *        isActive
 *        academicYear {
 *          name
 *        }
 *      }
 *    }
 * 
 * 2. Expected response format:
 *    {
 *      "data": {
 *        "termsByAcademicYear": [
 *          {
 *            "id": "81b98c7c-3c7f-4382-bf7d-e8526d0de97c",
 *            "name": "Fall 2024",
 *            "startDate": "2024-09-01T00:00:00.000Z",
 *            "endDate": "2024-12-15T00:00:00.000Z",
 *            "isActive": true,
 *            "academicYear": {
 *              "name": "2024-2025"
 *            }
 *          }
 *        ]
 *      }
 *    }
 * 
 * 3. If no terms exist, the component shows:
 *    - A "Create Academic Year" button if no academic year exists
 *    - A "Create Term" button if academic year exists but no terms
 * 
 * 4. The component integrates with existing CreateAcademicYearModal and CreateTermModal
 */
