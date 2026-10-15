export const LABEL_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
] as const

export type LabelColor = (typeof LABEL_COLORS)[number]

export interface Label {
  id: string
  name: string
  color: LabelColor
}
