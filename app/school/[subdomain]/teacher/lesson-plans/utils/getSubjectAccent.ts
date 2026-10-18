import { SUBJECT_ACCENTS } from '../constants/subjectAccents'

export function getSubjectAccent(key: string) {
  let hash = 0
  for (const char of key) hash = (hash + char.charCodeAt(0)) % SUBJECT_ACCENTS.length
  return SUBJECT_ACCENTS[hash]
}
