import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"

interface BucketSelectorProps {
  termIndex: number
  bucketIndex: number
  actualComponentIndex: number
  formData: any
  component: any
  feeBuckets: any[]
  updateBucket: (termIndex: number, bucketIndex: number, field: keyof any, value: any) => void
  updateComponent: (termIndex: number, bucketIndex: number, componentIndex: number, field: keyof any, value: any) => void
}

export const BucketSelector: React.FC<BucketSelectorProps> = ({
  termIndex,
  bucketIndex,
  actualComponentIndex,
  formData,
  component,
  feeBuckets,
  updateBucket,
  updateComponent
}) => {
  // Get the currently selected bucket ID
  const currentBucketId = formData.termStructures[termIndex]?.buckets[bucketIndex]?.id

  // Create a fee bucket via GraphQL, returning the created bucket
  const createFeeBucket = async (bucketData: { name: string; description: string }) => {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation CreateFeeBucket($input: CreateFeeBucketInput!) {
            createFeeBucket(input: $input) {
              id
              name
              description
              isActive
              createdAt
            }
          }
        `,
        variables: { input: bucketData }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    if (result.errors) {
      throw new Error(result.errors[0]?.message || 'Failed to create fee bucket')
    }

    return result.data.createFeeBucket as { id: string; name: string; description: string }
  }

  // Handle selecting a bucket: create it in DB, then select
  const handleSelectBucket = async (bucket: any) => {
    try {
      const created = await createFeeBucket({
        name: bucket.name,
        description: bucket.description || ''
      })

      updateBucket(termIndex, bucketIndex, 'id', created.id)
      updateBucket(termIndex, bucketIndex, 'name', created.name)
      updateBucket(termIndex, bucketIndex, 'description', created.description || '')

      updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', created.name)
    } catch (err) {
      // Fallback: still update selection locally to avoid blocking UX
      updateBucket(termIndex, bucketIndex, 'id', bucket.id)
      updateBucket(termIndex, bucketIndex, 'name', bucket.name)
      updateBucket(termIndex, bucketIndex, 'description', bucket.description || '')
      updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', bucket.name)
    }
  }

  // Auto-select the first existing bucket to show it in the votehead by default
  useEffect(() => {
    if (!currentBucketId && feeBuckets && feeBuckets.length > 0) {
      const firstBucket = feeBuckets[0]
      if (firstBucket) {
        updateBucket(termIndex, bucketIndex, 'id', firstBucket.id)
        updateBucket(termIndex, bucketIndex, 'name', firstBucket.name)
        updateBucket(termIndex, bucketIndex, 'description', firstBucket.description || '')
        updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', firstBucket.name)
      }
    }
    // Intentionally depend only on currentBucketId & feeBuckets list to avoid loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBucketId, feeBuckets])

  // Handle custom mode
  const handleCustomBucket = () => {
    updateBucket(termIndex, bucketIndex, 'id', undefined)
    updateBucket(termIndex, bucketIndex, 'name', '')
    updateBucket(termIndex, bucketIndex, 'description', '')
    updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', '')
  }

  // Handle updating custom component name
  const handleCustomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateComponent(termIndex, bucketIndex, actualComponentIndex, 'name', e.target.value)
  }

  // Check if we're in custom mode
  const isCustomMode = !currentBucketId
  
  // Always sort buckets alphabetically for consistent display
  const sortedBuckets = [...feeBuckets].sort((a, b) => 
    (a.name || '').localeCompare(b.name || '')
  )
  
  return (
    <div className="relative">
      {/* ALL BUCKETS (no filtering at all) */}
      <div className="flex flex-wrap gap-1 mb-2">
        {sortedBuckets.map((bucket) => (
          <Button
            key={bucket.id}
            variant={currentBucketId === bucket.id ? 'secondary' : 'outline'}
            size="sm"
            className={`h-8 px-2 text-xs ${currentBucketId === bucket.id ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
            onClick={() => handleSelectBucket(bucket)}
          >
            {bucket.name}
          </Button>
        ))}
        
        {/* Custom option */}
        <Button
          variant={isCustomMode ? 'secondary' : 'ghost'}
          size="sm"
          className={`h-8 px-2 text-xs ${isCustomMode ? 'bg-primary/10 text-primary border-primary/30' : 'hover:bg-primary/10'}`}
          onClick={handleCustomBucket}
        >
          ✏️ Custom
        </Button>
      </div>
      
      {/* Custom input field */}
      {isCustomMode && (
        <input
          className="w-full border border-primary/30 rounded p-1 text-xs"
          value={component.name || ''}
          onChange={handleCustomNameChange}
          placeholder="Enter custom fee name"
          autoFocus
        />
      )}
    </div>
  )
}
