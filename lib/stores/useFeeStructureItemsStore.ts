import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { graphqlClient } from '../graphql-client'
import { gql } from 'graphql-request'

// GraphQL query
const GET_FEE_STRUCTURE_ITEMS = gql`
  query GetAllFeeStructureItems {
    feeStructureItems {
      id
      feeBucket {
        id
        name
        description
      }
      feeStructure {
        id
        name
        academicYear { name }
        term { name }
      }
      amount
      isMandatory
    }
  }
`

// Types matching the GraphQL response
export interface GraphQLFeeStructureItem {
  id: string
  feeBucket: {
    id: string
    name: string
    description: string | null
  }
  feeStructure: {
    id: string
    name: string
    academicYear: { name: string }
    term: { name: string }
  }
  amount: number
  isMandatory: boolean
}

interface GetFeeStructureItemsResponse {
  feeStructureItems: GraphQLFeeStructureItem[]
}

interface FeeStructureItemsState {
  items: GraphQLFeeStructureItem[]
  isLoading: boolean
  error: string | null

  setItems: (items: GraphQLFeeStructureItem[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  reset: () => void
}

const initialState: Pick<FeeStructureItemsState, 'items' | 'isLoading' | 'error'> = {
  items: [],
  isLoading: false,
  error: null,
}

// Only enable devtools in browser environment
const createStore = (set: any) => ({
  ...initialState,

  setItems: (items: GraphQLFeeStructureItem[]) => set({ items, error: null }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error }),

  reset: () => set(initialState),
});

export const useFeeStructureItemsStore = create<FeeStructureItemsState>()(
  typeof window !== 'undefined'
    ? devtools(createStore, { name: 'fee-structure-items-store' })
    : createStore
)

// React-friendly fetcher
export const useFeeStructureItemsQuery = () => {
  const { setItems, setLoading, setError } = useFeeStructureItemsStore()

  const fetchFeeStructureItems = async (): Promise<GraphQLFeeStructureItem[]> => {
    setLoading(true)
    setError(null)
    try {
      const response = await graphqlClient.request<GetFeeStructureItemsResponse>(GET_FEE_STRUCTURE_ITEMS)
      const items = response.feeStructureItems
      setItems(items)
      return items
    } catch (error) {
      console.error('Error fetching feeStructureItems:', error)
      const message = error instanceof Error ? error.message : 'Failed to fetch fee structure items'
      setError(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchFeeStructureItems,
    refetch: fetchFeeStructureItems,
  }
}
