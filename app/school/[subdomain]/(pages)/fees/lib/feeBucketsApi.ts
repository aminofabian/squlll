import { matchCategoryToBucket } from "./feesSetupDraft";

function normalizeName(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export type FeeBucketRef = { id: string; name: string };

export async function fetchActiveFeeBuckets(): Promise<FeeBucketRef[]> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        query GetFeeBuckets {
          feeBuckets {
            id
            name
            isActive
          }
        }
      `,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to load fee items");
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to load fee items");
  }

  return (result.data?.feeBuckets ?? [])
    .filter((b: { isActive: boolean }) => b.isActive)
    .map((b: { id: string; name: string }) => ({ id: b.id, name: b.name }));
}

export async function createFeeBucket(input: {
  name: string;
  description?: string;
}): Promise<FeeBucketRef> {
  const response = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: `
        mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
          createFeeBucket(input: $input) {
            id
            name
          }
        }
      `,
      variables: {
        input: {
          name: input.name,
          description: input.description ?? `${input.name} fees`,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create fee item");
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0]?.message || "Failed to create fee item");
  }

  const bucket = result.data?.createFeeBucket;
  return { id: bucket.id, name: bucket.name };
}

/** Create any missing buckets for setup categories so prefill can run without manual steps */
export async function ensureBucketsForCategories(
  categories: string[],
  existing: FeeBucketRef[],
): Promise<FeeBucketRef[]> {
  const buckets = [...existing];
  const knownIds = new Set(buckets.map((b) => b.id));
  const knownNames = new Set(buckets.map((b) => normalizeName(b.name)));

  for (const category of categories) {
    const match = matchCategoryToBucket(category, buckets);
    if (match) continue;

    const normCat = normalizeName(category);
    if (knownNames.has(normCat)) continue;

    const created = await createFeeBucket({ name: category });
    if (!knownIds.has(created.id)) {
      buckets.push(created);
      knownIds.add(created.id);
      knownNames.add(normalizeName(created.name));
    }
  }

  return buckets;
}
