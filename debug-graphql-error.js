#!/usr/bin/env node

/**
 * Helper script to decode GraphQL validation errors
 * Run with: bun debug-graphql-error.js
 * 
 * Paste the error response from your GraphQL query below
 */

// Replace this with your actual error response
const errorResponse = {
  "errors": [
    {
      "message": "Input validation failed",
      "locations": [
        {
          "line": 3,
          "column": 9
        }
      ],
      "path": [
        "inviteTeacher"
      ],
      "extensions": {
        "code": "VALIDATION_ERROR"
      }
    }
  ]
};

// Known validation requirements
const knownRequirements = {
  email: "Must be valid email format",
  fullName: "Required string",
  firstName: "Required string",
  lastName: "Required string",
  role: "Should be 'TEACHER'", 
  gender: "Must be 'MALE' or 'FEMALE' (uppercase)",
  department: "Required string (lowercase recommended)",
  phoneNumber: "Must start with + and have 10-15 digits",
  address: "Optional string",
  employeeId: "Required string",
  dateOfBirth: "Required date in YYYY-MM-DD format",
  qualifications: "Required string",
  tenantSubjectIds: "Required array of UUIDs",
  tenantIds: "Required array of UUIDs",
  classTeacherTenantStreamId: "Optional UUID",
  classTeacherTenantGradeLevelId: "Optional UUID"
};

// Inspect the error
console.log("=".repeat(50));
console.log("GraphQL Error Analysis:");
console.log("=".repeat(50));

if (errorResponse.errors) {
  errorResponse.errors.forEach((error, i) => {
    console.log(`\nError ${i + 1}:`);
    console.log(`- Message: ${error.message}`);
    
    if (error.path) {
      console.log(`- Path: ${error.path.join(' > ')}`);
    }
    
    if (error.extensions) {
      console.log(`- Code: ${error.extensions.code}`);
      
      // Additional info for validation errors
      if (error.extensions.code === "VALIDATION_ERROR") {
        console.log("\nPossible validation issues:");
        
        Object.entries(knownRequirements).forEach(([field, requirement]) => {
          console.log(`- ${field}: ${requirement}`);
        });
      }
    }
  });
} else {
  console.log("No GraphQL errors found in the response");
}

console.log("\n\nTroubleshooting tips:");
console.log("1. Check that all required fields are present");
console.log("2. Verify that arrays (tenantSubjectIds, tenantGradeLevelIds) are not empty");
console.log("3. Ensure proper data types (strings, arrays, etc.)");
console.log("4. Verify that date formats are YYYY-MM-DD");
console.log("5. Make sure gender is exactly 'MALE' or 'FEMALE' (uppercase)");
console.log("6. Check that phone numbers start with + and have 10-15 digits");
console.log("7. Ensure that UUIDs are in valid format");
