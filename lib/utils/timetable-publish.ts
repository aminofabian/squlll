export async function publishTermTimetable(termId: string): Promise<string> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation PublishTermTimetable($input: PublishTermTimetableInput!) {
          publishTermTimetable(input: $input) {
            id
            timetablePublishedAt
          }
        }
      `,
      variables: { input: { termId } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 200) || 'Failed to publish timetable');
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(
      result.errors.map((e: { message: string }) => e.message).join(', '),
    );
  }

  const publishedAt = result.data?.publishTermTimetable?.timetablePublishedAt;
  if (!publishedAt) {
    throw new Error('Publish succeeded but no timestamp returned');
  }
  return publishedAt as string;
}

export async function unpublishTermTimetable(termId: string): Promise<void> {
  const response = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      query: `
        mutation UnpublishTermTimetable($input: PublishTermTimetableInput!) {
          unpublishTermTimetable(input: $input) {
            id
            timetablePublishedAt
          }
        }
      `,
      variables: { input: { termId } },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text.slice(0, 200) || 'Failed to unpublish timetable');
  }

  const result = await response.json();
  if (result.errors?.length) {
    throw new Error(
      result.errors.map((e: { message: string }) => e.message).join(', '),
    );
  }
}
