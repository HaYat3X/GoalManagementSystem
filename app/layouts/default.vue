<script setup>
import AppSidebar from "../components/AppSidebar.vue"
</script>

<template>
  <div class="layout">
    <AppSidebar />
    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
  /* padding: 40px; */
}
</style>