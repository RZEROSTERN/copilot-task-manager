import type { Board } from './board'
import type { Card } from './card'
import type { Label } from './label'
import type { TaskList } from './list'

export interface BoardState {
  boards: Board[]
  lists: TaskList[]
  cards: Card[]
  labels: Label[]
  activeBoardId: string | null
}
