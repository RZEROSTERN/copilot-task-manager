export interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

export interface Card {
  id: string
  listId: string
  title: string
  description: string
  labels: string[]
  dueDate?: string
  checklist: ChecklistItem[]
  assignee?: string
  createdAt: string
}
