// Test script to verify that object destructuring correctly removes tenantId

// Sample data that includes tenantId
const createTeacherDto = {
  email: "test@example.com",
  fullName: "Test Teacher",
  firstName: "Test",
  lastName: "Teacher",
  role: "TEACHER",
  tenantSubjectIds: ["subject-id-1"],
  tenantGradeLevelIds: ["grade-id-1"],
  tenantId: "tenant-id-to-be-removed"  // This should be removed
};

console.log("ORIGINAL OBJECT:");
console.log(createTeacherDto);
console.log("Has tenantId property:", 'tenantId' in createTeacherDto);

// Using object destructuring to remove tenantId
const { tenantId: _, ...cleanedTeacherDto } = createTeacherDto;

console.log("\nCLEANED OBJECT:");
console.log(cleanedTeacherDto);
console.log("Has tenantId property:", 'tenantId' in cleanedTeacherDto);

// Double checking with JSON.stringify to make sure it's truly gone
console.log("\nJSON STRING OF CLEANED OBJECT:");
console.log(JSON.stringify(cleanedTeacherDto, null, 2));

// Verifying that the cleanedTeacherDto is what's actually sent in the GraphQL request
const requestBody = {
  query: "mutation...",
  variables: {
    createTeacherDto: cleanedTeacherDto
  }
};

console.log("\nACTUAL REQUEST BODY:");
console.log(JSON.stringify(requestBody, null, 2));
console.log("Request variables has tenantId:", 'tenantId' in requestBody.variables.createTeacherDto);

// Run this with: bun test-tenantid-removal.js
