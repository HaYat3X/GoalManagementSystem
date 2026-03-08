<script setup lang="ts">
import { ref } from "vue"

const isCollapsed = ref(false)
const sidebarWidth = ref(260)
const isResizing = ref(false)

const workspaceName = ref("My Workspace")
const userAvatar = ref("YK")

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

function startResize(e: MouseEvent) {
  isResizing.value = true
  const startX = e.clientX
  const startWidth = sidebarWidth.value

  const onMouseMove = (e: MouseEvent) => {
    const delta = e.clientX - startX
    sidebarWidth.value = Math.min(480, Math.max(200, startWidth + delta))
  }

  const onMouseUp = () => {
    isResizing.value = false
    window.removeEventListener("mousemove", onMouseMove)
    window.removeEventListener("mouseup", onMouseUp)
  }

  window.addEventListener("mousemove", onMouseMove)
  window.addEventListener("mouseup", onMouseUp)
}
</script>

<template>
  <aside class="sidebar" :class="{ collapsed: isCollapsed }"
    :style="{ width: isCollapsed ? '0px' : `${sidebarWidth}px` }">
    <div class="sidebar-inner">

      <div class="workspace-header">
        <div class="workspace-info">
          <div class="workspace-avatar">{{ userAvatar }}</div>
          <span class="workspace-name">{{ workspaceName }}</span>
        </div>

        <button class="icon-btn" @click="toggleSidebar">
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <nav class="nav-section">
        <NuxtLink class="nav-item" to="/">ダッシュボード</NuxtLink>
        <NuxtLink class="nav-item" to="/smart">SMART Goals</NuxtLink>
        <NuxtLink class="nav-item" to="/year">年間目標</NuxtLink>
      </nav>

    </div>

    <div class="resize-handle" :class="{ resizing: isResizing }" @mousedown="startResize" />
  </aside>

  <button v-if="isCollapsed" class="expand-btn" @click="toggleSidebar">
    <svg width="14" height="14" viewBox="0 0 24 24">
      <path d="M9 18l6-6-6-6" />
    </svg>
  </button>
</template>

<style scoped>
.sidebar {
  position: relative;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.2s ease;
  background: #f7f7f5;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 200px;
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
}

.workspace-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.workspace-avatar {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2d7ef7, #7b4ef7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.nav-section {
  padding: 6px;
}

.nav-item {
  display: flex;
  padding: 6px 10px;
  border-radius: 6px;
  color: #6b6b68;
  text-decoration: none;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: col-resize;
}

.expand-btn {
  position: fixed;
  top: 10px;
  left: 10px;
}
</style>