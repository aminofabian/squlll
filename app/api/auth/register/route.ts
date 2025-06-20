import { NextResponse } from 'next/server'

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, name, schoolName } = body

    // GraphQL mutation
    const mutation = `
      mutation CreateUser($input: CreateUserInput!) {
        createUser(createUserInput: $input) {
          user {
            id
            email
            name
            userRole
          }
          school {
            schoolName
          }
          subdomainUrl
        }
      }
    `

    // Make request to GraphQL API
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: mutation,
        variables: {
          input: {
            email,
            password,
            name,
            userRole: "SUPER_ADMIN",
            schoolName
          }
        }
      })
    })

    const data = await response.json()

    // Check for GraphQL errors
    if (data.errors) {
      return NextResponse.json(
        { error: data.errors[0].message },
        { status: 400 }
      )
    }

    // Return success response
    return NextResponse.json(data.data.createUser)

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    )
  }
} 