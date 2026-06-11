import { chatGraphqlFetch } from '@/lib/chat/graphql'

const PUBLISH_RESULTS = `
  mutation PublishAssessmentResults($id: String!) {
    publishAssessmentResults(id: $id) {
      id
      resultsPublished
      publishDate
    }
  }
`

const UNPUBLISH_RESULTS = `
  mutation UnpublishAssessmentResults($id: String!) {
    unpublishAssessmentResults(id: $id) {
      id
      resultsPublished
      publishDate
    }
  }
`

export async function publishAssessmentResults(
  subdomain: string,
  assessmentId: string,
): Promise<void> {
  await chatGraphqlFetch(PUBLISH_RESULTS, { id: assessmentId }, subdomain)
}

export async function unpublishAssessmentResults(
  subdomain: string,
  assessmentId: string,
): Promise<void> {
  await chatGraphqlFetch(UNPUBLISH_RESULTS, { id: assessmentId }, subdomain)
}
