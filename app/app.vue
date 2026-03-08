<template>
  <div>
    <!-- <Sidebar @toggle="onSidebarToggle" /> -->
    <AppSidebar />
    <h1>でも</h1>

  </div>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/AppSidebar.vue'
// import Sidebar from '~/components/Sidebar.vue'
// import { ref } from 'vue'

// const isSidebarOpen = ref(true)

// const onSidebarToggle = (isOpen: boolean) => {
//   isSidebarOpen.value = isOpen
// }
</script>

<style scoped>
.main-content {
  margin-left: 250px;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.main-content-shifted {
  margin-left: 60px;
  /* Adjust based on toggle button width */
}
</style>
