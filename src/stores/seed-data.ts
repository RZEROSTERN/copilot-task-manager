import type { BoardState, Card, Label, TaskList } from '../types'

const day = 24 * 60 * 60 * 1000

function dateOffset(offset: number): string {
  return new Date(Date.now() + offset * day).toISOString()
}

const labels: Label[] = [
  { id: 'label-design', name: 'Design', color: '#8b5cf6' },
  { id: 'label-development', name: 'Development', color: '#3b82f6' },
  { id: 'label-research', name: 'Research', color: '#14b8a6' },
  { id: 'label-priority', name: 'Priority', color: '#ef4444' },
  { id: 'label-content', name: 'Content', color: '#f97316' },
  { id: 'label-review', name: 'Review', color: '#22c55e' },
]

const lists: TaskList[] = [
  { id: 'list-todo', boardId: 'board-sample', title: 'To Do', cardIds: [], position: 0 },
  { id: 'list-progress', boardId: 'board-sample', title: 'In Progress', cardIds: [], position: 1 },
  { id: 'list-review', boardId: 'board-sample', title: 'In Review', cardIds: [], position: 2 },
  { id: 'list-done', boardId: 'board-sample', title: 'Done', cardIds: [], position: 3 },
]

const cards: Card[] = [
  {
    id: 'card-discovery',
    listId: 'list-todo',
    title: 'Interview customers about their workflow',
    description: 'Collect feedback from a mix of new and returning customers.',
    labels: ['label-research', 'label-priority'],
    dueDate: dateOffset(3),
    checklist: [
      { id: 'check-discovery-1', text: 'Prepare interview questions', done: true },
      { id: 'check-discovery-2', text: 'Schedule five interviews', done: false },
      { id: 'check-discovery-3', text: 'Summarize findings', done: false },
    ],
    assignee: 'Alex Morgan',
    createdAt: dateOffset(-8),
  },
  {
    id: 'card-wireframes',
    listId: 'list-todo',
    title: 'Sketch the new board overview',
    description: 'Explore a compact board card layout for the home screen.',
    labels: ['label-design'],
    checklist: [],
    assignee: 'Jordan Lee',
    createdAt: dateOffset(-6),
  },
  {
    id: 'card-copy',
    listId: 'list-todo',
    title: 'Draft onboarding empty states',
    description: 'Keep the language friendly and focused on the next action.',
    labels: ['label-content'],
    dueDate: dateOffset(-2),
    checklist: [{ id: 'check-copy-1', text: 'Write first draft', done: true }],
    createdAt: dateOffset(-5),
  },
  {
    id: 'card-board-layout',
    listId: 'list-progress',
    title: 'Build responsive board layout',
    description: 'Make columns scroll horizontally on small screens.',
    labels: ['label-development', 'label-priority'],
    dueDate: dateOffset(1),
    checklist: [
      { id: 'check-layout-1', text: 'Add desktop grid', done: true },
      { id: 'check-layout-2', text: 'Tune mobile scrolling', done: false },
    ],
    assignee: 'Sam Rivera',
    createdAt: dateOffset(-4),
  },
  {
    id: 'card-labels',
    listId: 'list-progress',
    title: 'Define the label color palette',
    description: '',
    labels: ['label-design'],
    checklist: [],
    assignee: 'Taylor Kim',
    createdAt: dateOffset(-3),
  },
  {
    id: 'card-storage',
    listId: 'list-progress',
    title: 'Review local persistence approach',
    description: 'Confirm how the browser storage adapter can be replaced later.',
    labels: ['label-development', 'label-research'],
    dueDate: dateOffset(5),
    checklist: [
      { id: 'check-storage-1', text: 'Document repository interface', done: true },
      { id: 'check-storage-2', text: 'Test a reload', done: true },
    ],
    createdAt: dateOffset(-2),
  },
  {
    id: 'card-icons',
    listId: 'list-review',
    title: 'Review navigation icon options',
    description: 'Check contrast and alignment at compact sidebar widths.',
    labels: ['label-design', 'label-review'],
    checklist: [{ id: 'check-icons-1', text: 'Compare icon sizes', done: true }],
    assignee: 'Jordan Lee',
    createdAt: dateOffset(-7),
  },
  {
    id: 'card-checklist',
    listId: 'list-review',
    title: 'Check keyboard interaction notes',
    description: 'Verify that essential actions have a keyboard alternative.',
    labels: ['label-review'],
    dueDate: dateOffset(2),
    checklist: [],
    createdAt: dateOffset(-1),
  },
  {
    id: 'card-project-brief',
    listId: 'list-done',
    title: 'Write the initial project brief',
    description: 'Capture the prototype goals, platform targets, and constraints.',
    labels: ['label-content', 'label-review'],
    checklist: [
      { id: 'check-brief-1', text: 'List MVP features', done: true },
      { id: 'check-brief-2', text: 'Agree on feature sequence', done: true },
    ],
    assignee: 'Alex Morgan',
    createdAt: dateOffset(-10),
  },
]

for (const card of cards) {
  const list = lists.find((candidate) => candidate.id === card.listId)
  if (!list) throw new Error(`Seed card references missing list "${card.listId}".`)
  list.cardIds.push(card.id)
}

export function createSeedData(): BoardState {
  return {
    boards: [
      {
        id: 'board-sample',
        title: 'Product Launch',
        color: '#4f46e5',
        listIds: lists.map((list) => list.id),
        createdAt: dateOffset(-10),
      },
    ],
    activeBoardId: 'board-sample',
    lists: lists.map((list) => ({ ...list, cardIds: [...list.cardIds] })),
    cards: cards.map((card) => ({
      ...card,
      labels: [...card.labels],
      checklist: card.checklist.map((item) => ({ ...item })),
    })),
    labels: labels.map((label) => ({ ...label })),
  }
}
