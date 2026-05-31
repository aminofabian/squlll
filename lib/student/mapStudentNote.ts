import type { StudentNoteApi, StudentNoteFileType, StudentNoteItem } from './types'

function inferFileType(url: string): StudentNoteFileType {
  const path = url.split('?')[0] ?? url
  const ext = path.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return 'pdf'
    case 'doc':
    case 'docx':
      return 'docx'
    case 'ppt':
    case 'pptx':
      return 'pptx'
    case 'xls':
    case 'xlsx':
      return 'xlsx'
    case 'jpg':
    case 'jpeg':
      return 'jpg'
    case 'png':
      return 'png'
    case 'mp4':
      return 'mp4'
    case 'mp3':
      return 'mp3'
    case 'zip':
      return 'zip'
    default:
      return 'link'
  }
}

export function mapStudentNoteToItem(note: StudentNoteApi): StudentNoteItem {
  const links = note.links ?? []
  const primaryLink = links[0]
  const fileType = primaryLink ? inferFileType(primaryLink) : 'link'
  const tags: string[] = []
  if (note.is_ai_generated) tags.push('ai-generated')
  if (note.visibility === 'SCHOOL') tags.push('school-wide')
  if (note.visibility === 'GRADE') tags.push('grade')

  return {
    id: note.id,
    title: note.title,
    subject: note.subject?.name ?? 'General',
    teacher: note.teacher.name,
    description: note.content,
    fileType,
    fileSize: links.length > 0 ? `${links.length} file${links.length === 1 ? '' : 's'}` : 'Text note',
    uploadDate: note.created_at.slice(0, 10),
    downloadCount: 0,
    isFavorite: false,
    tags,
    grade: note.gradeLevel?.name ?? 'All grades',
    links,
    lastUpdated: note.updated_at.slice(0, 10),
  }
}
