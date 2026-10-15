import { computed, ref } from 'vue'
import type { Card, Label } from '../types'

export function useBoardSearch() {
  const query = ref('')
  const selectedLabelIds = ref<string[]>([])
  const searchInput = ref<HTMLInputElement | null>(null)

  const hasActiveFilters = computed(
    () => query.value.trim().length > 0 || selectedLabelIds.value.length > 0,
  )

  function matches(card: Card, labels: Label[]): boolean {
    const normalizedQuery = query.value.trim().toLocaleLowerCase()
    const textMatches =
      normalizedQuery.length === 0 ||
      card.title.toLocaleLowerCase().includes(normalizedQuery) ||
      card.description.toLocaleLowerCase().includes(normalizedQuery) ||
      (card.assignee?.toLocaleLowerCase().includes(normalizedQuery) ?? false) ||
      card.labels.some((id) =>
        labels.find((label) => label.id === id)?.name.toLocaleLowerCase().includes(normalizedQuery),
      )
    const labelMatches =
      selectedLabelIds.value.length === 0 ||
      selectedLabelIds.value.every((labelId) => card.labels.includes(labelId))
    return textMatches && labelMatches
  }

  function toggleLabelFilter(labelId: string): void {
    selectedLabelIds.value = selectedLabelIds.value.includes(labelId)
      ? selectedLabelIds.value.filter((selectedId) => selectedId !== labelId)
      : [...selectedLabelIds.value, labelId]
  }

  function clearFilters(): void {
    query.value = ''
    selectedLabelIds.value = []
  }

  function focusSearch(): void {
    searchInput.value?.focus()
    searchInput.value?.select()
  }

  return {
    query,
    selectedLabelIds,
    searchInput,
    hasActiveFilters,
    matches,
    toggleLabelFilter,
    clearFilters,
    focusSearch,
  }
}
