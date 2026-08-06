export function getSchoolDisplayName(subdomain: string) {
  return subdomain
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
