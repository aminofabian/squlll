/**
 * Returns the appropriate Tailwind CSS classes for a boarding type badge
 */
export const getBoardingTypeColor = (type: string) => {
  switch (type) {
    case 'day': return 'bg-blue-100 text-blue-800'
    case 'boarding': return 'bg-green-100 text-green-800'
    case 'both': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}
