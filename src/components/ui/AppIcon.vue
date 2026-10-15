<script setup lang="ts">
defineProps<{
  name:
    | 'grid'
    | 'chevron'
    | 'plus'
    | 'sun'
    | 'moon'
    | 'panel'
    | 'external'
    | 'more'
    | 'close'
    | 'check'
    | 'calendar'
    | 'drag'
    | 'search'
    | 'filter'
    | 'clear'
    | 'download'
  size?: number
}>()
</script>

<template>
  <svg
    :width="size ?? 18"
    :height="size ?? 18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <template v-if="name === 'grid'">
      <rect
        x="3.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="13.5"
        y="3.5"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="3.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
      />
      <rect
        x="13.5"
        y="13.5"
        width="7"
        height="7"
        rx="1.5"
      />
    </template>
    <path
      v-else-if="name === 'chevron'"
      d="m9 18 6-6-6-6"
    />
    <path
      v-else-if="name === 'plus'"
      d="M12 5v14M5 12h14"
    />
    <template v-else-if="name === 'more'">
      <circle
        cx="5"
        cy="12"
        r="1"
      />
      <circle
        cx="12"
        cy="12"
        r="1"
      />
      <circle
        cx="19"
        cy="12"
        r="1"
      />
    </template>
    <path
      v-else-if="name === 'close'"
      d="m6 6 12 12M18 6 6 18"
    />
    <path
      v-else-if="name === 'check'"
      d="m5 12 4 4L19 6"
    />
    <template v-else-if="name === 'calendar'">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M16 3v4M8 3v4M3 10h18" />
    </template>
    <path
      v-else-if="name === 'drag'"
      d="M9 5h.01M15 5h.01M9 12h.01M15 12h.01M9 19h.01M15 19h.01"
      stroke-width="3"
    />
    <template v-else-if="name === 'search'">
      <circle
        cx="10.8"
        cy="10.8"
        r="6.8"
      />
      <path d="m16 16 4.5 4.5" />
    </template>
    <path
      v-else-if="name === 'filter'"
      d="M4 5h16l-6.2 7.2v5.3l-3.6 1.8v-7.1L4 5Z"
    />
    <path
      v-else-if="name === 'clear'"
      d="m6 6 12 12M18 6 6 18"
    />
    <path
      v-else-if="name === 'download'"
      d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"
    />
    <template v-else-if="name === 'sun'">
      <circle
        cx="12"
        cy="12"
        r="4"
      />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M20.3 15.1A8.5 8.5 0 0 1 8.9 3.7 8.5 8.5 0 1 0 20.3 15.1Z" />
    </template>
    <template v-else-if="name === 'panel'">
      <rect
        x="3"
        y="4"
        width="18"
        height="16"
        rx="2"
      />
      <path d="M9 4v16" />
    </template>
    <template v-else>
      <path d="M14 3h7v7m0-7L10 14" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </template>
  </svg>
</template>
