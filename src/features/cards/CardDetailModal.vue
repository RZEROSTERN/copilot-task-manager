<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import type { Card, Label, LabelColor, TaskList } from '../../types'
import { LABEL_COLORS } from '../../types'
import AppIcon from '../../components/ui/AppIcon.vue'
import { useBoardStore } from '../../stores/board'

const props = defineProps<{
  cardId: string | null
}>()

const emit = defineEmits<{
  close: []
  delete: [card: Card]
}>()

const store = useBoardStore()
const dialog = ref<HTMLDialogElement | null>(null)
const titleInput = ref<HTMLInputElement | null>(null)
const checklistInput = ref<HTMLInputElement | null>(null)
const labelNameInput = ref<HTMLInputElement | null>(null)
const showLabelCreator = ref(false)
const newLabelName = ref('')
const newLabelColor = ref<LabelColor>(LABEL_COLORS[5])
const card = computed(() => props.cardId ? store.cardById(props.cardId) : undefined)
const lists = computed<TaskList[]>(() => {
  const currentCard = card.value
  if (!currentCard) return []
  const currentList = store.listById(currentCard.listId)
  if (!currentList) return []
  return store.listsForBoard(currentList.boardId)
})
const completedItems = computed(
  () => card.value?.checklist.filter((item) => item.done).length ?? 0,
)
const dueDateInput = computed({
  get: () => {
    if (!card.value?.dueDate) return ''
    const date = new Date(card.value.dueDate)
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10)
  },
  set: (value: string) => {
    if (!card.value) return
    store.updateCard(card.value.id, {
      dueDate: value ? new Date(`${value}T12:00:00`).toISOString() : undefined,
    })
  },
})

watch(
  () => props.cardId,
  async (cardId) => {
    await nextTick()
    if (cardId && dialog.value && !dialog.value.open) dialog.value.showModal()
    if (cardId) titleInput.value?.focus()
    else if (dialog.value?.open) dialog.value.close()
  },
)

onBeforeUnmount(() => {
  if (dialog.value?.open) dialog.value.close()
})

function close(): void {
  emit('close')
}

function onCancel(event: Event): void {
  event.preventDefault()
  close()
}

function onBackdropClick(event: MouseEvent): void {
  if (event.target === dialog.value) close()
}

function updateTitle(event: Event): void {
  if (!card.value) return
  const title = (event.target as HTMLInputElement).value.trim()
  if (title) store.updateCard(card.value.id, { title })
}

function updateDescription(event: Event): void {
  if (!card.value) return
  store.updateCard(card.value.id, {
    description: (event.target as HTMLTextAreaElement).value,
  })
}

function updateAssignee(event: Event): void {
  if (!card.value) return
  const assignee = (event.target as HTMLInputElement).value.trim()
  store.updateCard(card.value.id, { assignee: assignee || undefined })
}

function toggleLabel(label: Label): void {
  if (!card.value) return
  const labelIds = new Set(card.value.labels)
  if (labelIds.has(label.id)) labelIds.delete(label.id)
  else labelIds.add(label.id)
  store.updateCard(card.value.id, { labels: [...labelIds] })
}

async function openLabelCreator(): Promise<void> {
  showLabelCreator.value = true
  await nextTick()
  labelNameInput.value?.focus()
}

function createLabel(): void {
  const name = newLabelName.value.trim()
  if (!card.value || !name) return
  const label = store.createLabel(name, newLabelColor.value)
  store.updateCard(card.value.id, { labels: [...card.value.labels, label.id] })
  newLabelName.value = ''
  showLabelCreator.value = false
}

async function addChecklistItem(): Promise<void> {
  if (!card.value) return
  const text = checklistInput.value?.value.trim()
  if (!text) return
  store.addChecklistItem(card.value.id, text)
  if (checklistInput.value) checklistInput.value.value = ''
  await nextTick()
  checklistInput.value?.focus()
}

function toggleChecklistItem(itemId: string, done: boolean): void {
  if (card.value) store.updateChecklistItem(card.value.id, itemId, { done })
}

function updateChecklistText(itemId: string, event: Event): void {
  if (!card.value) return
  const text = (event.target as HTMLInputElement).value.trim()
  if (text) store.updateChecklistItem(card.value.id, itemId, { text })
}

function moveCard(event: Event): void {
  if (!card.value) return
  const target = event.target as HTMLSelectElement
  const [listId, positionValue] = target.value.split(':')
  if (!listId) return
  const position = Number(positionValue)
  store.moveCard(card.value.id, listId, Number.isFinite(position) ? position : undefined)
}

function requestDelete(): void {
  if (!card.value) return
  const confirmed = window.confirm(`Delete "${card.value.title}"? This cannot be undone.`)
  if (confirmed) emit('delete', card.value)
}

function trapTab(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !dialog.value) return
  const focusable = [...dialog.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
  )].filter((element) => element.getClientRects().length > 0)
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.value.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="card-detail-dialog"
    aria-labelledby="card-detail-title"
    @cancel="onCancel"
    @click="onBackdropClick"
    @keydown="trapTab"
  >
    <template v-if="card">
      <div class="card-detail-layout">
        <main class="card-detail-main">
          <header class="card-detail-heading">
            <span class="detail-card-symbol"><AppIcon
              name="check"
              :size="18"
            /></span>
            <div class="detail-heading-fields">
              <label
                class="visually-hidden"
                for="detail-card-title"
              >Card title</label>
              <input
                id="detail-card-title"
                ref="titleInput"
                class="detail-title-input"
                type="text"
                maxlength="240"
                :value="card.title"
                @change="updateTitle"
                @keydown.enter.prevent="($event.target as HTMLInputElement).blur()"
              >
              <p class="detail-list-context">
                in <strong>{{ store.listById(card.listId)?.title }}</strong>
              </p>
            </div>
            <button
              class="icon-button detail-close"
              type="button"
              aria-label="Close card details"
              @click="close"
            >
              <AppIcon
                name="close"
                :size="18"
              />
            </button>
          </header>

          <section class="detail-section">
            <h3>Description</h3>
            <label
              class="visually-hidden"
              for="detail-description"
            >Card description</label>
            <textarea
              id="detail-description"
              class="detail-description-input"
              rows="5"
              placeholder="Add a more detailed description… Markdown is supported."
              :value="card.description"
              @change="updateDescription"
            />
            <p class="detail-hint">
              Basic Markdown formatting is supported.
            </p>
          </section>

          <section class="detail-section checklist-section">
            <div class="detail-section-heading">
              <h3>Checklist</h3>
              <span class="checklist-summary">{{ completedItems }}/{{ card.checklist.length }}</span>
            </div>
            <div
              v-for="item in card.checklist"
              :key="item.id"
              class="checklist-item"
            >
              <input
                :id="`check-${item.id}`"
                class="checklist-checkbox"
                type="checkbox"
                :aria-label="`Mark ${item.text} complete`"
                :checked="item.done"
                @change="toggleChecklistItem(item.id, ($event.target as HTMLInputElement).checked)"
              >
              <input
                class="checklist-text-input"
                :class="{ 'is-done': item.done }"
                :aria-label="`Checklist item: ${item.text}`"
                :value="item.text"
                @change="updateChecklistText(item.id, $event)"
              >
              <button
                class="icon-button checklist-delete"
                type="button"
                :aria-label="`Delete checklist item ${item.text}`"
                @click="store.deleteChecklistItem(card.id, item.id)"
              >
                <AppIcon
                  name="close"
                  :size="14"
                />
              </button>
            </div>
            <form
              class="checklist-add-form"
              @submit.prevent="addChecklistItem"
            >
              <input
                ref="checklistInput"
                type="text"
                maxlength="160"
                aria-label="New checklist item"
                placeholder="Add an item"
              >
              <button
                class="secondary-button checklist-add-button"
                type="submit"
              >
                Add item
              </button>
            </form>
          </section>
        </main>

        <aside class="card-detail-sidebar">
          <div class="detail-side-section">
            <label
              class="detail-side-label"
              for="move-card"
            >Move to</label>
            <select
              id="move-card"
              class="detail-select"
              :value="`${card.listId}:${store.listById(card.listId)?.cardIds.indexOf(card.id) ?? 0}`"
              @change="moveCard"
            >
              <optgroup
                v-for="list in lists"
                :key="list.id"
                :label="list.title"
              >
                <option
                  v-for="position in list.cardIds.length + 1"
                  :key="`${list.id}-${position - 1}`"
                  :value="`${list.id}:${position - 1}`"
                >
                  {{ position === list.cardIds.length + 1
                    ? 'At end'
                    : `Position ${position}${position === 1 ? ' (top)' : ''}` }}
                </option>
              </optgroup>
            </select>
            <p class="detail-hint">
              Choose a list and position as a keyboard alternative to dragging.
            </p>
          </div>

          <div class="detail-side-section">
            <label
              class="detail-side-label"
              for="due-date"
            >Due date</label>
            <input
              id="due-date"
              v-model="dueDateInput"
              class="detail-select"
              type="date"
            >
            <button
              v-if="card.dueDate"
              class="detail-clear-button"
              type="button"
              @click="dueDateInput = ''"
            >
              Clear date
            </button>
          </div>

          <div class="detail-side-section">
            <label
              class="detail-side-label"
              for="assignee"
            >Assignee</label>
            <input
              id="assignee"
              class="detail-select"
              type="text"
              maxlength="80"
              placeholder="Name"
              :value="card.assignee"
              @change="updateAssignee"
            >
          </div>

          <div class="detail-side-section detail-label-section">
            <h3 class="detail-side-label">
              Labels
            </h3>
            <div class="detail-label-options">
              <button
                v-for="label in store.labels"
                :key="label.id"
                class="detail-label-option"
                :class="{ 'is-selected': card.labels.includes(label.id) }"
                type="button"
                :aria-pressed="card.labels.includes(label.id)"
                @click="toggleLabel(label)"
              >
                <span :style="{ backgroundColor: label.color }" />
                {{ label.name }}
                <AppIcon
                  v-if="card.labels.includes(label.id)"
                  name="check"
                  :size="14"
                />
              </button>
            </div>
            <button
              v-if="!showLabelCreator"
              class="detail-add-label"
              type="button"
              @click="openLabelCreator"
            >
              <AppIcon
                name="plus"
                :size="14"
              />
              Create a label
            </button>
            <form
              v-else
              class="label-create-form"
              @submit.prevent="createLabel"
            >
              <input
                ref="labelNameInput"
                v-model="newLabelName"
                type="text"
                maxlength="40"
                aria-label="New label name"
                placeholder="Label name"
              >
              <div class="label-color-options">
                <button
                  v-for="color in LABEL_COLORS"
                  :key="color"
                  class="label-color-option"
                  :class="{ 'is-selected': newLabelColor === color }"
                  type="button"
                  :style="{ '--swatch': color }"
                  :aria-label="`Choose ${color}`"
                  :aria-pressed="newLabelColor === color"
                  @click="newLabelColor = color"
                />
              </div>
              <button
                class="secondary-button checklist-add-button"
                type="submit"
                :disabled="!newLabelName.trim()"
              >
                Save label
              </button>
            </form>
          </div>

          <div class="detail-side-footer">
            <span>Created {{ new Date(card.createdAt).toLocaleDateString() }}</span>
            <button
              class="delete-card-button"
              type="button"
              @click="requestDelete"
            >
              <AppIcon
                name="close"
                :size="14"
              />
              Delete card
            </button>
          </div>
        </aside>
      </div>
    </template>
  </dialog>
</template>
