<script setup lang="ts">
import { ref } from 'vue'

// --- State ---
const isCollapsed = ref(false)
const sidebarWidth = ref(260)
const isResizing = ref(false)
const workspaceName = ref('My Workspace')
const userAvatar = ref('YK')

// --- Methods ---
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
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div class="sidebar-wrapper" :class="{ collapsed: isCollapsed }">
    <!-- Sidebar -->
    <aside class="sidebar" :style="{ width: isCollapsed ? '0px' : `${sidebarWidth}px` }">
      <div class="sidebar-inner">

        <!-- Header: Workspace -->
        <div class="workspace-header">
          <div class="workspace-info">
            <div class="workspace-avatar">{{ userAvatar }}</div>
            <span class="workspace-name">{{ workspaceName }}</span>
          </div>
          <div class="header-actions">
            <button class="icon-btn" title="Collapse sidebar" @click="toggleSidebar">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Nav Actions -->
        <nav class="nav-section">
          <a class="nav-item" href="#">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Home
          </a>
          <a class="nav-item" href="#">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            All pages
          </a>
          <a class="nav-item" href="#">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            Updates
          </a>
        </nav>
      </div>

      <!-- Resize Handle -->
      <div class="resize-handle" :class="{ resizing: isResizing }" @mousedown="startResize" />
    </aside>

    <!-- Toggle button when collapsed -->
    <button v-if="isCollapsed" class="expand-btn" @click="toggleSidebar">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M9 18l6-6-6-6" />
      </svg>
    </button>

    <!-- Main content slot -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>



<style scoped>
/* ===== Layout ===== */
.sidebar-wrapper {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.sidebar {
  position: relative;
  height: 100%;
  flex-shrink: 0;
  overflow: hidden;
  transition: width 0.2s ease;
  background: #f7f7f5;
  border-right: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-wrapper.collapsed .sidebar {
  border-right: none;
}

.sidebar-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 200px;
}

.main-content {
  flex: 1;
  overflow: auto;
  background: #fff;
}

/* ===== Workspace Header ===== */
.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 10px 6px 14px;
  gap: 8px;
  cursor: pointer;
  border-radius: 6px;
  margin: 4px 6px 0;
  transition: background 0.1s;
}

.workspace-header:hover {
  background: rgba(0, 0, 0, 0.05);
}

.workspace-info {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
}

.workspace-avatar {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: linear-gradient(135deg, #2d7ef7, #7b4ef7);
  color: white;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  letter-spacing: 0.3px;
}

.workspace-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  flex-shrink: 0;
}

/* ===== Nav Items ===== */
.nav-section {
  padding: 4px 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 16px;
  color: #6b6b68;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1a1a1a;
}

/* ===== Buttons ===== */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  color: #91918e;
  transition: background 0.1s, color 0.1s;
  padding: 0;
  flex-shrink: 0;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.07);
  color: #1a1a1a;
}

/* ===== Resize Handle ===== */
.resize-handle {
  position: absolute;
  top: 0;
  right: -2px;
  width: 4px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
  transition: background 0.15s;
}

.resize-handle:hover,
.resize-handle.resizing {
  background: rgba(45, 126, 247, 0.4);
}

/* ===== Expand Button (when collapsed) ===== */
.expand-btn {
  position: fixed;
  top: 10px;
  left: 8px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  color: #91918e;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: background 0.1s, color 0.1s;
}

.expand-btn:hover {
  background: #f7f7f5;
  color: #1a1a1a;
}
</style>