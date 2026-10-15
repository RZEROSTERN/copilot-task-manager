<script setup lang="ts">
import { computed } from 'vue'
import type { Card, Label } from '../../types'
import AppIcon from '../../components/ui/AppIcon.vue'

const props = defineProps<{
  card: Card
  labels: Label[]
}>()

const completedChecklistCount = computed(
  () => props.card.checklist.filter((item) => item.done).length,
)
const cardLabels = computed(() =>
  props.card.labels
    .map((labelId) => props.labels.find((label) => label.id === labelId))
    .filter((label): label is Label => label !== undefined),
)
const initials = computed(() => {
  const name = props.card.assignee?.trim()
  if (!name) return null
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
})
const dueDateLabel = computed(() => {
  if (!props.card.dueDate) return null
  const dueDate = new Date(props.card.dueDate)
  if (Number.isNaN(dueDate.getTime())) return null
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(dueDate)
})
const isOverdue = computed(() => {
  if (!props.card.dueDate) return false
  const due = new Date(props.card.dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !Number.isNaN(due.getTime()) && due.getTime() < today.getTime()
})
</script>

<template>
  <article class="task-card">
    <div
      v-if="cardLabels.length"
      class="task-card-labels"
    >
      <span
        v-for="label in cardLabels"
        :key="label.id"
        class="task-label"
        :style="{ '--label-color': label.color }"
        :title="label.name"
      >
        {{ label.name }}
      </span>
    </div>

    <h4 class="task-card-title">
      {{ card.title }}
    </h4>

    <div class="task-card-meta">
      <span
        v-if="dueDateLabel"
        class="task-meta-pill due-date-pill"
        :class="{ 'is-overdue': isOverdue }"
        :title="isOverdue ? 'Overdue' : 'Due date'"
      >
        <AppIcon
          name="calendar"
          :size="13"
        />
        {{ dueDateLabel }}
      </span>
      <span
        v-if="card.checklist.length"
        class="task-meta-pill checklist-pill"
        :title="`${completedChecklistCount} of ${card.checklist.length} checklist items complete`"
      >
        <AppIcon
          name="check"
          :size="13"
        />
        {{ completedChecklistCount }}/{{ card.checklist.length }}
      </span>
      <span class="task-card-spacer" />
      <span
        v-if="initials"
        class="assignee-avatar"
        :title="card.assignee"
        :aria-label="`Assigned to ${card.assignee}`"
      >
        {{ initials }}
      </span>
    </div>
  </article>
</template>
