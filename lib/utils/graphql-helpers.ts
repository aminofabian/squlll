/**
 * Helper functions for working with GraphQL
 */

/**
 * Cleans a DTO by removing the tenantId field which is not part of the GraphQL schema
 * @param dto - The data transfer object to clean
 * @returns A new object without the tenantId field
 */
export function cleanGraphQLDto<T extends Record<string, any>>(dto: T): Omit<T, 'tenantId'> {
  // Use destructuring to remove tenantId from the top level
  const { tenantId, ...cleanedDto } = dto;
  return cleanedDto;
}

/**
 * Prepares a GraphQL mutation request with proper variables format
 * @param mutation - The GraphQL mutation string
 * @param variables - The variables object
 * @returns A properly formatted request body
 */
export function prepareGraphQLRequest(mutation: string, variables: Record<string, any>): {
  query: string;
  variables: Record<string, any>;
} {
  return {
    query: mutation,
    variables
  };
}

/**
 * Creates a GraphQL mutation with inline parameters (no variables)
 * @param dto - The data to include in the mutation
 * @returns A string containing the full GraphQL mutation with inline parameters
 */
export function buildInlineGraphQLMutation(operationName: string, dto: Record<string, any>, returnFields: string[]): string {
  // Convert object to GraphQL inline format
  const fieldLines = Object.entries(dto).map(([key, value]) => {
    // Handle arrays (like tenantSubjectIds, tenantGradeLevelIds)
    if (Array.isArray(value)) {
      const arrayItems = value.map(item => {
        return typeof item === 'string' ? `"${item}"` : item;
      }).join('\n      ');
      return `${key}: [\n      ${arrayItems}\n    ]`;
    }
    // Handle strings (add quotes)
    else if (typeof value === 'string') {
      return `${key}: "${value}"`;
    }
    // Handle other types
    else {
      return `${key}: ${value}`;
    }
  }).join('\n    ');

  const returnFieldsStr = returnFields.join('\n    ');

  return `
    mutation ${operationName} {
      inviteTeacher(
        createTeacherDto: {
          ${fieldLines}
        }
      ) {
        ${returnFieldsStr}
      }
    }
  `;
}

/**
 * Creates a properly formatted teacher invitation mutation using variables format
 * @param teacherData - The teacher data object
 * @returns A properly formatted GraphQL request
 */
export function createTeacherInvitationRequest(teacherData: Record<string, any>) {
  // Clean the DTO by removing tenantId
  const cleanedTeacherDto = cleanGraphQLDto(teacherData);
  
  // Ensure department is lowercase
  if (cleanedTeacherDto.department) {
    cleanedTeacherDto.department = cleanedTeacherDto.department.toLowerCase();
  }
  
  const mutation = `
    mutation InviteTeacher($createTeacherDto: CreateTeacherInvitationDto!) {
      inviteTeacher(createTeacherDto: $createTeacherDto) {
        email
        fullName
        status
        createdAt
      }
    }
  `;
  
  return prepareGraphQLRequest(mutation, { createTeacherDto: cleanedTeacherDto });
}

/**
 * Creates a properly formatted teacher invitation mutation using inline format
 * @param teacherData - The teacher data object 
 * @returns A properly formatted GraphQL request
 */
export function createTeacherInvitationInline(teacherData: Record<string, any>) {
  // Clean the DTO by removing tenantId
  const cleanedTeacherDto = cleanGraphQLDto(teacherData);
  
  // Ensure department is lowercase
  if (cleanedTeacherDto.department) {
    cleanedTeacherDto.department = cleanedTeacherDto.department.toLowerCase();
  }
  
  // Create inline mutation
  const inlineMutation = buildInlineGraphQLMutation(
    "InviteTeacher",
    cleanedTeacherDto,
    ["email", "fullName", "status", "createdAt"]
  );
  
  return { query: inlineMutation };
}
