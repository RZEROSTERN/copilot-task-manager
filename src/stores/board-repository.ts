import { LABEL_COLORS, type BoardState, type Label } from '../types'

export interface BoardRepository {
  load(): BoardState | null
  save(state: BoardState): void
}

export const BOARD_STORAGE_KEY = 'board-store'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

function isLabel(value: unknown): value is Label {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.color === 'string' &&
    LABEL_COLORS.some((color) => color === value.color)
  )
}

function isBoardState(value: unknown): value is BoardState {
  if (!isRecord(value)) return false

  const candidate = value
  return (
    (candidate.activeBoardId === null || typeof candidate.activeBoardId === 'string') &&
    Array.isArray(candidate.boards) &&
    candidate.boards.every(
      (board) =>
        isRecord(board) &&
        typeof board.id === 'string' &&
        typeof board.title === 'string' &&
        typeof board.color === 'string' &&
        isStringArray(board.listIds) &&
        typeof board.createdAt === 'string',
    ) &&
    Array.isArray(candidate.lists) &&
    candidate.lists.every(
      (list) =>
        isRecord(list) &&
        typeof list.id === 'string' &&
        typeof list.boardId === 'string' &&
        typeof list.title === 'string' &&
        isStringArray(list.cardIds) &&
        typeof list.position === 'number',
    ) &&
    Array.isArray(candidate.cards) &&
    candidate.cards.every(
      (card) =>
        isRecord(card) &&
        typeof card.id === 'string' &&
        typeof card.listId === 'string' &&
        typeof card.title === 'string' &&
        typeof card.description === 'string' &&
        isStringArray(card.labels) &&
        (card.dueDate === undefined || typeof card.dueDate === 'string') &&
        Array.isArray(card.checklist) &&
        card.checklist.every(
          (item) =>
            isRecord(item) &&
            typeof item.id === 'string' &&
            typeof item.text === 'string' &&
            typeof item.done === 'boolean',
        ) &&
        (card.assignee === undefined || typeof card.assignee === 'string') &&
        typeof card.createdAt === 'string',
    ) &&
    Array.isArray(candidate.labels) &&
    candidate.labels.every(isLabel)
  )
}

export class LocalStorageBoardRepository implements BoardRepository {
  load(): BoardState | null {
    if (typeof window === 'undefined') return null

    const serialized = window.localStorage.getItem(BOARD_STORAGE_KEY)
    if (serialized === null) return null

    const data: unknown = JSON.parse(serialized)
    if (!isBoardState(data)) {
      throw new Error('Saved board data has an invalid format.')
    }

    return data
  }

  save(state: BoardState): void {
    if (typeof window === 'undefined') {
      throw new Error('Board data can only be saved in a browser environment.')
    }

    window.localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(state))
  }
}

export const boardRepository: BoardRepository = new LocalStorageBoardRepository()
