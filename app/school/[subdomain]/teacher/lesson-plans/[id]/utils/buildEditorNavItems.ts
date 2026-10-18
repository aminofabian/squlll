import { EDITOR_SECTIONS, type EditorSectionId } from '../constants/editorSections'
import type { EditorNavItem } from '../types'

export function buildEditorNavItems(
  completed: Record<EditorSectionId, boolean>,
  hasReviews: boolean,
): EditorNavItem[] {
  return EDITOR_SECTIONS.filter((section) => hasReviews || section.id !== 'history').map(
    (section) => ({ ...section, complete: completed[section.id] }),
  )
}
