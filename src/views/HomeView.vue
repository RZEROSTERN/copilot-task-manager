<template>
  <div class="home-view">
    <section class="welcome-panel">
      <div class="welcome-icon">
        <span /><span /><span /><span />
      </div>
      <p class="eyebrow">
        Your workspace
      </p>
      <h2>Your work, in a better flow.</h2>
      <p class="welcome-copy">
        Your boards are ready. Choose one from the sidebar to get started, or create a new board
        for your next project.
      </p>
      <div class="welcome-stats">
        <div><strong>{{ boardCount }}</strong><span>{{ boardCount === 1 ? 'board' : 'boards' }}</span></div>
        <div><strong>Private</strong><span>just for you</span></div>
        <div><strong>Saved</strong><span>on this device</span></div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  boardCount: number
}>()
</script>
