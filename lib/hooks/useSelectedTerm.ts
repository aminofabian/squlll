import { useTerm } from '../../app/school/[subdomain]/(pages)/contexts/TermContext'

/**
 * Hook to access the currently selected term across the application
 * @returns The selected term and a function to update it
 */
export function useSelectedTerm() {
  return useTerm()
}
