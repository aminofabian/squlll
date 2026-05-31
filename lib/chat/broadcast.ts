import { chatGraphqlFetch } from './graphql'

export interface BroadcastResult {
  success: boolean
  studentsReached: number
  parentsReached: number
  messageIds: string[]
}

const BROADCAST_TO_STUDENTS = `
  mutation BroadcastToStudents($content: String!) {
    broadcastToStudents(content: $content) {
      success
      studentsReached
      parentsReached
      messageIds
    }
  }
`

export async function broadcastToStudents(
  subdomain: string,
  content: string,
): Promise<BroadcastResult> {
  const data = await chatGraphqlFetch<{ broadcastToStudents: BroadcastResult }>(
    BROADCAST_TO_STUDENTS,
    { content },
    subdomain,
  )
  return data.broadcastToStudents
}
