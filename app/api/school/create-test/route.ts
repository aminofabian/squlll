import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://skool.zelisline.com/graphql';

export async function POST(request: Request) {
  try {
    const testData = await request.json();
    console.log('Received test data:', testData);
    
    // Get the token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      console.error('No access token found in cookies');
      return NextResponse.json(
        { error: 'Authentication required. Please log in.' },
        { status: 401 }
      );
    }

    // Map form data to GraphQL input matching exact mutation structure
    const createTestInput = {
      title: testData.title,
      subject: testData.subject,
      gradeLevelIds: testData.gradeLevelIds, // Array of grade level IDs from school config
      date: testData.date,
      startTime: testData.startTime,
      duration: parseInt(testData.duration, 10),
      totalMarks: parseInt(testData.points, 10),
      resourceUrl: testData.resourceUrl || "",
      instructions: testData.instructions || "",
      questions: testData.questions.map((question: any, index: number) => ({
        text: question.text,
        marks: question.marks || 10, // Default marks if not specified
        order: index + 1,
        type: question.type === "mcq" ? "MULTIPLE_CHOICE" : 
              question.type === "short" ? "SHORT_ANSWER" : 
              question.type === "tf" ? "TRUE_FALSE" : "MULTIPLE_CHOICE",
        isAIGenerated: question.isAIGenerated || false,
        ...(question.options && question.options.length > 0 && {
          options: question.options.map((option: string, optIndex: number) => ({
            text: option,
            isCorrect: question.correct === optIndex,
            order: optIndex + 1
          }))
        })
      })),
      referenceMaterials: testData.referenceMaterials || []
    };

    console.log('Mapped test input:', createTestInput);

    // Prepare GraphQL mutation
    const mutation = `
      mutation CreateTest($createTestInput: CreateTestInput!) {
        createTest(createTestInput: $createTestInput) {
          id
          title
          subject
          date
          startTime
          duration
          totalMarks
          resourceUrl
          instructions
          questions {
            id
            text
            marks
            order
            type
            isAIGenerated
            options {
              id
              text
              isCorrect
              order
            }
          }
          referenceMaterials {
            id
            fileUrl
            fileType
            fileSize
          }
          createdAt
        }
      }
    `;

    const requestBody = {
      query: mutation,
      variables: {
        createTestInput
      }
    };

    console.log('Sending GraphQL request to:', GRAPHQL_ENDPOINT);
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('GraphQL response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GraphQL request failed:', errorText);
      return NextResponse.json(
        { error: 'GraphQL request failed', details: errorText },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('GraphQL response:', result);
    
    if (result.errors) {
      console.error('CreateTest mutation failed:', result.errors);
      return NextResponse.json(
        { error: 'Error creating test', details: result.errors },
        { status: 500 }
      );
    }

    const testRecord = result.data.createTest;
    console.log('Successfully created test:', testRecord);

    return NextResponse.json({
      createTest: testRecord
    });
  } catch (error) {
    console.error('Error creating test:', error);
    return NextResponse.json(
      { error: 'Failed to create test', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 