import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }



    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);
    
    const { 
      parentData, 
      students, 
      linkingMethod = 'MANUAL_INPUT',
      tenantId 
    } = body;

    if (!parentData || !students || students.length === 0) {
      return NextResponse.json(
        { error: 'Parent data and at least one student are required.' },
        { status: 400 }
      );
    }

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required in the request body.' },
        { status: 400 }
      );
    }

    console.log('Parent Invite API - Processing invitation for:', parentData.name);
    console.log('Parent Invite API - Students count:', students.length);
    console.log('Parent Invite API - Linking method:', linkingMethod);
    console.log('Parent Invite API - Tenant ID:', tenantId);

    // Process each student and create invitations
    const invitations = [];
    const errors = [];

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      console.log(`Processing student ${i + 1}:`, student);
      
      try {
        // First, search for the student to get their ID (only for search methods)
        let studentId = null;
        
        if (linkingMethod === 'SEARCH_BY_NAME') {
          // Search by name
          const searchQuery = `
            query SearchStudentsByName($name: String!, $tenantId: String!) {
              searchStudentsByName(
                name: $name
                tenantId: $tenantId
              ) {
                id
                name
                admissionNumber
                grade
                phone
                streamId
              }
            }
          `;

          const searchResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: searchQuery,
              variables: {
                name: student.name,
                tenantId
              }
            })
          });

          const searchResult = await searchResponse.json();
          
          if (searchResult.errors) {
            throw new Error(`Search failed for student ${student.name}: ${searchResult.errors[0].message}`);
          }

          const searchData = searchResult.data?.searchStudentsByName;
          if (searchData && searchData.length > 0) {
            studentId = searchData[0].id;
          } else {
            throw new Error(`Student ${student.name} not found`);
          }
        } else if (linkingMethod === 'SEARCH_BY_ADMISSION') {
          // Search by admission number
          const searchQuery = `
            query SearchStudentByAdmission($admissionNumber: String!, $tenantId: String!) {
              searchStudentByAdmission(
                admissionNumber: $admissionNumber
                tenantId: $tenantId
              ) {
                id
                name
                admissionNumber
                grade
                phone
                streamId
              }
            }
          `;

          const searchResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: searchQuery,
              variables: {
                admissionNumber: student.admissionNumber,
                tenantId
              }
            })
          });

          const searchResult = await searchResponse.json();
          
          if (searchResult.errors) {
            throw new Error(`Search failed for student ${student.name}: ${searchResult.errors[0].message}`);
          }

          const searchData = searchResult.data?.searchStudentByAdmission;
          if (searchData) {
            studentId = searchData.id;
          } else {
            throw new Error(`Student with admission number ${student.admissionNumber} not found`);
          }
        }
        // For manual input, we need to search for the student first to get the ID
        let inviteMutation;
        let variables;
        
                // For MANUAL_INPUT, we need to search for the student first to get the ID
        if (linkingMethod === 'MANUAL_INPUT') {
          // Search by manual input to get student ID
          const searchQuery = `
            query SearchStudentsByManualInput($tenantId: String!, $studentFullName: String!, $studentGrade: String!) {
              searchStudentsByManualInput(
                tenantId: $tenantId
                studentFullName: $studentFullName
                studentGrade: $studentGrade
              ) {
                id
                name
                admissionNumber
                grade
                phone
                streamId
              }
            }
          `;

          const searchResponse = await fetch(GRAPHQL_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              query: searchQuery,
              variables: {
                tenantId,
                studentFullName: student.name,
                studentGrade: student.grade,
              }
            })
          });

          const searchResult = await searchResponse.json();
          console.log(`Manual input search result for ${student.name}:`, searchResult);
          console.log(`Search variables:`, { tenantId, studentFullName: student.name, studentGrade: student.grade });
          
          if (!searchResult.errors && searchResult.data?.searchStudentsByManualInput) {
            const searchData = searchResult.data.searchStudentsByManualInput;
            console.log(`Search data returned:`, searchData);
            if (searchData && searchData.length > 0) {
              studentId = searchData[0].id;
              console.log(`Found student by manual input search: ${searchData[0].name} in grade ${searchData[0].grade}`);
            } else {
              console.log(`No students found in search results`);
            }
          } else {
            console.log(`Search errors or no data:`, searchResult.errors);
          }

          if (!studentId) {
            // Try a broader search by name only
            console.log(`Trying broader search by name only...`);
            const nameSearchQuery = `
              query SearchStudentsByName($name: String!, $tenantId: String!) {
                searchStudentsByName(
                  name: $name
                  tenantId: $tenantId
                ) {
                  id
                  name
                  admissionNumber
                  grade
                  phone
                  streamId
                }
              }
            `;

            const nameSearchResponse = await fetch(GRAPHQL_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({
                query: nameSearchQuery,
                variables: {
                  name: student.name,
                  tenantId
                }
              })
            });

            const nameSearchResult = await nameSearchResponse.json();
            console.log(`Name search result:`, nameSearchResult);
            
            if (!nameSearchResult.errors && nameSearchResult.data?.searchStudentsByName) {
              const studentsByName = nameSearchResult.data.searchStudentsByName;
              console.log(`Students found by name:`, studentsByName);
              
              // Find any student with this name, regardless of grade
              if (studentsByName.length > 0) {
                studentId = studentsByName[0].id;
                console.log(`Found student by name search: ${studentsByName[0].name} in grade ${studentsByName[0].grade}`);
              }
            }
          }

          if (!studentId) {
            throw new Error(`Student ${student.name} not found in the system. Tried searching in grade ${student.grade} and by name only. Please check the student name and grade.`);
          }
        }

        // Create the parent invitation (all methods require studentIds)
        // Note: createParentDto only contains parent information, not student fields
        // Student linking is handled via the studentIds parameter
        // Note: tenantId is handled via the authentication token, not passed as a parameter
        inviteMutation = `
          mutation InviteParent($studentIds: [String!]!) {
            inviteParent(
              createParentDto: {
                email: "${parentData.email || ''}"
                name: "${parentData.name}"
                phone: "${parentData.phone}"
              }
              studentIds: $studentIds
            ) {
              email
              name
              status
              createdAt
              students {
                id
                name
                admissionNumber
              }
            }
          }
        `;
        
        variables = {
          studentIds: [studentId]
        };

        const inviteResponse = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            query: inviteMutation,
            variables
          })
        });

        const inviteResult = await inviteResponse.json();
        
        if (inviteResult.errors) {
          throw new Error(`Invitation failed for student ${student.name}: ${inviteResult.errors[0].message}`);
        }

        const invitationData = inviteResult.data?.inviteParent;
        if (invitationData) {
          invitations.push({
            student: student.name,
            invitation: invitationData
          });
        } else {
          throw new Error(`No invitation data returned for student ${student.name}`);
        }

      } catch (error: any) {
        console.error(`Error processing student ${student.name}:`, error);
        errors.push({
          student: student.name,
          error: error.message
        });
      }
    }

    // Return results
    if (errors.length > 0 && invitations.length === 0) {
      // All failed
      return NextResponse.json(
        { 
          error: 'All invitations failed',
          details: errors
        },
        { status: 400 }
      );
    } else if (errors.length > 0) {
      // Partial success
      return NextResponse.json({
        success: true,
        message: `Successfully invited parent for ${invitations.length} student(s), ${errors.length} failed`,
        invitations,
        errors
      });
    } else {
      // All successful
      return NextResponse.json({
        success: true,
        message: `Successfully invited parent for ${invitations.length} student(s)`,
        invitations
      });
    }

  } catch (error) {
    console.error('Error inviting parent:', error);
    return NextResponse.json(
      { error: 'Failed to invite parent' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 