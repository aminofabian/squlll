// Test script to verify the GetStudentSummary GraphQL query
// Run this with: bun run test-student-summary.js

import { GraphQLClient } from 'graphql-request'

// Use local API endpoint for testing
const graphqlClient = new GraphQLClient('http://localhost:3000/api/graphql', {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

const GET_STUDENT_SUMMARY = `
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
`

async function testStudentSummary() {
  try {
    console.log('Testing GetStudentSummary query...')
    
    const studentId = "02d25893-e184-43f3-baf9-5b07ca3caa41"
    
    const response = await graphqlClient.request(GET_STUDENT_SUMMARY, { studentId })
    
    console.log('✅ Query successful!')
    console.log('Response:', JSON.stringify(response, null, 2))
    
    // Verify the response structure
    if (response.data?.studentSummary) {
      const student = response.data.studentSummary
      console.log('\n📊 Student Summary:')
      console.log(`Name: ${student.studentName}`)
      console.log(`Admission: ${student.admissionNumber}`)
      console.log(`Email: ${student.email}`)
      console.log(`Phone: ${student.phone}`)
      console.log(`Grade: ${student.gradeLevelName}`)
      console.log(`Curriculum: ${student.curriculumName}`)
      console.log(`Stream: ${student.streamName || 'Not assigned'}`)
      console.log(`Status: ${student.isActive ? 'Active' : 'Inactive'}`)
      
      console.log('\n💰 Fee Summary:')
      console.log(`Total Owed: KES ${student.feeSummary.totalOwed.toLocaleString()}`)
      console.log(`Total Paid: KES ${student.feeSummary.totalPaid.toLocaleString()}`)
      console.log(`Balance: KES ${student.feeSummary.balance.toLocaleString()}`)
      console.log(`Number of Fee Items: ${student.feeSummary.numberOfFeeItems}`)
      
      if (student.feeSummary.feeItems.length > 0) {
        console.log('\n📋 Fee Items:')
        student.feeSummary.feeItems.forEach((item, index) => {
          console.log(`${index + 1}. ${item.feeBucketName} - KES ${item.amount.toLocaleString()}`)
          console.log(`   Structure: ${item.feeStructureName}`)
          console.log(`   Academic Year: ${item.academicYearName}`)
          console.log(`   Mandatory: ${item.isMandatory ? 'Yes' : 'No'}`)
        })
      }
    } else {
      console.log('❌ No student data found in response')
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error)
    
    if (error.response) {
      console.error('Response errors:', error.response.errors)
    }
  }
}

testStudentSummary()
