import { defineStore } from 'pinia'
import { BOARD_STORAGE_KEY, boardRepository } from './board-repository'
import { createSeedData } from './seed-data'
import type { Board, BoardState, Card, ChecklistItem, Label, TaskList } from '../types'

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`
}

export const useBoardStore = defineStore('board-store', {
  state: (): BoardState => {
    const savedState = boardRepository.load()
    if (savedState) return savedState

    const seed = createSeedData()
    boardRepository.save(seed)
    return seed
  },
  getters: {
    boardById: (state) => (boardId: string) =>
      state.boards.find((board) => board.id === boardId),
    listById: (state) => (listId: string) =>
      state.lists.find((list) => list.id === listId),
    cardById: (state) => (cardId: string) =>
      state.cards.find((card) => card.id === cardId),
    listsForBoard: (state) => (boardId: string) =>
      state.lists
        .filter((list) => list.boardId === boardId)
        .sort((first, second) => first.position - second.position),
    cardsForList: (state) => (listId: string) => {
      const list = state.lists.find((candidate) => candidate.id === listId)
      if (!list) return []
      return list.cardIds
        .map((cardId) => state.cards.find((card) => card.id === cardId))
        .filter((card): card is Card => card !== undefined)
    },
  },
  actions: {
    persist(): void {
      boardRepository.save(this.$state)
    },
    createBoard(title: string, color = '#4f46e5'): Board {
      const board: Board = {
        id: createId('board'),
        title: title.trim(),
        color,
        listIds: [],
        createdAt: new Date().toISOString(),
      }
      this.boards.push(board)
      this.persist()
      return board
    },
    updateBoard(boardId: string, updates: Partial<Pick<Board, 'title' | 'color'>>): void {
      const board = this.boards.find((candidate) => candidate.id === boardId)
      if (!board) return
      Object.assign(
        board,
        updates,
        updates.title !== undefined ? { title: updates.title.trim() } : {},
      )
      this.persist()
    },
    deleteBoard(boardId: string): void {
      const listIds = this.lists
        .filter((list) => list.boardId === boardId)
        .map((list) => list.id)
      const cardIds = new Set(
        this.cards.filter((card) => listIds.includes(card.listId)).map((card) => card.id),
      )
      this.boards = this.boards.filter((board) => board.id !== boardId)
      this.lists = this.lists.filter((list) => list.boardId !== boardId)
      this.cards = this.cards.filter((card) => !cardIds.has(card.id))
      this.persist()
    },
    createList(boardId: string, title: string): TaskList {
      const board = this.boards.find((candidate) => candidate.id === boardId)
      if (!board) throw new Error(`Cannot create a list for missing board "${boardId}".`)
      const list: TaskList = {
        id: createId('list'),
        boardId,
        title: title.trim(),
        cardIds: [],
        position: board.listIds.length,
      }
      this.lists.push(list)
      board.listIds.push(list.id)
      this.persist()
      return list
    },
    renameList(listId: string, title: string): void {
      const list = this.lists.find((candidate) => candidate.id === listId)
      if (!list) return
      list.title = title.trim()
      this.persist()
    },
    deleteList(listId: string): void {
      const list = this.lists.find((candidate) => candidate.id === listId)
      if (!list) return
      const board = this.boards.find((candidate) => candidate.id === list.boardId)
      if (board) board.listIds = board.listIds.filter((id) => id !== listId)
      this.cards = this.cards.filter((card) => card.listId !== listId)
      this.lists = this.lists
        .filter((candidate) => candidate.id !== listId)
        .map((candidate) =>
          candidate.boardId === list.boardId
            ? { ...candidate, position: board?.listIds.indexOf(candidate.id) ?? candidate.position }
            : candidate,
        )
      this.persist()
    },
    reorderLists(boardId: string, listIds: string[]): void {
      const board = this.boards.find((candidate) => candidate.id === boardId)
      if (!board) return
      const boardLists = this.lists.filter((list) => list.boardId === boardId)
      const allowedIds = new Set(boardLists.map((list) => list.id))
      if (
        listIds.length !== allowedIds.size ||
        new Set(listIds).size !== allowedIds.size ||
        listIds.some((id) => !allowedIds.has(id))
      ) {
        throw new Error('List order must contain every board list exactly once.')
      }
      board.listIds = [...listIds]
      this.lists = this.lists.map((list) => {
        if (list.boardId !== boardId) return list
        return { ...list, position: listIds.indexOf(list.id) }
      })
      this.persist()
    },
    createCard(listId: string, title: string): Card {
      const list = this.lists.find((candidate) => candidate.id === listId)
      if (!list) throw new Error(`Cannot create a card in missing list "${listId}".`)
      const card: Card = {
        id: createId('card'),
        listId,
        title: title.trim(),
        description: '',
        labels: [],
        checklist: [],
        createdAt: new Date().toISOString(),
      }
      this.cards.push(card)
      list.cardIds.push(card.id)
      this.persist()
      return card
    },
    updateCard(cardId: string, updates: Partial<Omit<Card, 'id' | 'listId'>>): void {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      if (!card) return
      Object.assign(card, updates)
      this.persist()
    },
    deleteCard(cardId: string): void {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      if (!card) return
      const list = this.lists.find((candidate) => candidate.id === card.listId)
      if (list) list.cardIds = list.cardIds.filter((id) => id !== cardId)
      this.cards = this.cards.filter((candidate) => candidate.id !== cardId)
      this.persist()
    },
    moveCard(cardId: string, targetListId: string, position?: number): void {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      const sourceList = card && this.lists.find((list) => list.id === card.listId)
      const targetList = this.lists.find((list) => list.id === targetListId)
      if (!card || !sourceList || !targetList) {
        throw new Error('Cannot move a card when its card or list does not exist.')
      }
      if (sourceList.boardId !== targetList.boardId) {
        throw new Error('Cards can only be moved between lists on the same board.')
      }

      sourceList.cardIds = sourceList.cardIds.filter((id) => id !== cardId)
      const insertAt = Math.max(0, Math.min(position ?? targetList.cardIds.length, targetList.cardIds.length))
      targetList.cardIds.splice(insertAt, 0, cardId)
      card.listId = targetListId
      this.persist()
    },
    reorderCards(listId: string, cardIds: string[]): void {
      const list = this.lists.find((candidate) => candidate.id === listId)
      if (!list) throw new Error(`Cannot reorder cards in missing list "${listId}".`)
      const existingIds = new Set(list.cardIds)
      if (
        cardIds.length !== existingIds.size ||
        new Set(cardIds).size !== existingIds.size ||
        cardIds.some((id) => !existingIds.has(id))
      ) {
        throw new Error('Card order must contain every list card exactly once.')
      }
      list.cardIds = [...cardIds]
      this.persist()
    },
    addChecklistItem(cardId: string, text: string): ChecklistItem {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      if (!card) throw new Error(`Cannot add a checklist item to missing card "${cardId}".`)
      const item: ChecklistItem = { id: createId('check'), text: text.trim(), done: false }
      card.checklist.push(item)
      this.persist()
      return item
    },
    updateChecklistItem(cardId: string, itemId: string, updates: Partial<Pick<ChecklistItem, 'text' | 'done'>>): void {
      const item = this.cards
        .find((card) => card.id === cardId)
        ?.checklist.find((candidate) => candidate.id === itemId)
      if (!item) return
      Object.assign(item, updates)
      this.persist()
    },
    deleteChecklistItem(cardId: string, itemId: string): void {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      if (!card) return
      card.checklist = card.checklist.filter((item) => item.id !== itemId)
      this.persist()
    },
    createLabel(name: string, color: Label['color']): Label {
      const label: Label = { id: createId('label'), name: name.trim(), color }
      this.labels.push(label)
      this.persist()
      return label
    },
  },
  persist: {
    key: BOARD_STORAGE_KEY,
  },
})
