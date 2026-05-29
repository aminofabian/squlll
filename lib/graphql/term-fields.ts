/** Term fields safe on all deployed GraphQL schemas (no timetablePublishedAt). */
export const TERM_LIST_SELECTION = `
  id
  name
  startDate
  endDate
  isActive
  academicYear {
    name
  }
`
