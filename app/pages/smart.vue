<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

// =====================
// Types
// =====================
type SmartStatus = 'on_track' | 'at_risk' | 'completed' | 'not_started'
type SmartPriority = 'high' | 'medium' | 'low'

interface SmartItem {
  id: string
  title: string
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timeBound: string
  status: SmartStatus
  priority: SmartPriority
  owner: string
  dueDate: string
  progress: number
}

// =====================
// Constants
// =====================
const STATUS_CONFIG: Record<SmartStatus, { label: string; color: string; bg: string }> = {
  on_track: { label: 'On Track', color: '#2e7d32', bg: '#e8f5e9' },
  at_risk: { label: 'At Risk', color: '#c62828', bg: '#ffebee' },
  completed: { label: 'Completed', color: '#1565c0', bg: '#e3f2fd' },
  not_started: { label: 'Not Started', color: '#6b6b68', bg: '#f0f0ee' },
}

const PRIORITY_CONFIG: Record<SmartPriority, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: '#c62828', dot: '#ef5350' },
  medium: { label: 'Medium', color: '#e65100', dot: '#ff7043' },
  low: { label: 'Low', color: '#2e7d32', dot: '#66bb6a' },
}

const SMART_FIELDS: { key: keyof SmartItem; label: string; short: string }[] = [
  { key: 'specific', label: 'Specific', short: 'S' },
  { key: 'measurable', label: 'Measurable', short: 'M' },
  { key: 'achievable', label: 'Achievable', short: 'A' },
  { key: 'relevant', label: 'Relevant', short: 'R' },
  { key: 'timeBound', label: 'Time-bound', short: 'T' },
]

// =====================
// Data
// =====================
const items = ref<SmartItem[]>([
  {
    id: '1',
    title: 'Grow Monthly Active Users',
    specific: 'Increase MAU by 25% through onboarding improvements',
    measurable: 'Track via analytics dashboard weekly',
    achievable: 'Allocated 2 engineers + 1 designer',
    relevant: 'Directly tied to Q3 growth OKR',
    timeBound: 'By end of Q3 2025',
    status: 'on_track',
    priority: 'high',
    owner: 'Yuki K.',
    dueDate: '2025-09-30',
    progress: 62,
  },
  {
    id: '2',
    title: 'Reduce Support Ticket Volume',
    specific: 'Decrease tickets 30% via self-serve docs',
    measurable: 'Monthly ticket count from Zendesk',
    achievable: 'Content team + AI chatbot integration',
    relevant: 'Supports NPS improvement goal',
    timeBound: 'End of August 2025',
    status: 'at_risk',
    priority: 'high',
    owner: 'Sato M.',
    dueDate: '2025-08-31',
    progress: 28,
  },
  {
    id: '3',
    title: 'Launch Mobile App v2',
    specific: 'Ship redesigned iOS & Android apps',
    measurable: 'App Store rating ≥ 4.5, D7 retention ≥ 40%',
    achievable: '5-person mobile team, 12-week sprint',
    relevant: 'Core to FY26 mobile-first strategy',
    timeBound: 'October 15, 2025',
    status: 'on_track',
    priority: 'high',
    owner: 'Park J.',
    dueDate: '2025-10-15',
    progress: 45,
  },
  {
    id: '4',
    title: 'Improve CI/CD Pipeline Speed',
    specific: 'Cut average build time from 14min → 6min',
    measurable: 'CI dashboard average over 30-day window',
    achievable: 'Platform team owns infra changes',
    relevant: 'Developer velocity KPI',
    timeBound: 'End of July 2025',
    status: 'completed',
    priority: 'medium',
    owner: 'Chen R.',
    dueDate: '2025-07-31',
    progress: 100,
  },
  {
    id: '5',
    title: 'Establish Data Governance Policy',
    specific: 'Define data classification, access, retention rules',
    measurable: 'Policy adopted by all 6 product teams',
    achievable: 'Legal + Eng leads aligned',
    relevant: 'Required for SOC2 Type II',
    timeBound: 'Q4 2025',
    status: 'not_started',
    priority: 'medium',
    owner: 'Inoue T.',
    dueDate: '2025-12-31',
    progress: 0,
  },
  {
    id: '6',
    title: 'Increase Revenue Per User',
    specific: 'Upsell 15% of free users to paid plans',
    measurable: 'Stripe MRR conversion rate',
    achievable: 'Growth team + in-app upgrade prompts',
    relevant: 'Critical for Series B metrics',
    timeBound: 'End of Q3',
    status: 'at_risk',
    priority: 'high',
    owner: 'Yuki K.',
    dueDate: '2025-09-30',
    progress: 19,
  },
])

// =====================
// State
// =====================
const editingCell = ref<{ id: string; field: keyof SmartItem } | null>(null)
const editValue = ref('')
const editInputRef = ref<HTMLElement | null>(null)
const hoveredRow = ref<string | null>(null)
const selectedRows = ref<Set<string>>(new Set())
const openDetailId = ref<string | null>(null)
const newRowAdding = ref(false)
const filterStatus = ref<SmartStatus | 'all'>('all')
const sortField = ref<keyof SmartItem | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')
const searchQuery = ref('')

// =====================
// Computed
// =====================
const filteredItems = computed(() => {
  let list = items.value

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i => i.title.toLowerCase().includes(q) || i.owner.toLowerCase().includes(q))
  }

  if (filterStatus.value !== 'all') {
    list = list.filter(i => i.status === filterStatus.value)
  }

  if (sortField.value) {
    const f = sortField.value
    list = [...list].sort((a, b) => {
      const av = String(a[f]).toLowerCase()
      const bv = String(b[f]).toLowerCase()
      return sortDir.value === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }

  return list
})

const openDetail = computed(() => items.value.find(i => i.id === openDetailId.value) ?? null)

const allSelected = computed(() =>
  filteredItems.value.length > 0 &&
  filteredItems.value.every(i => selectedRows.value.has(i.id))
)

// =====================
// Methods
// =====================
function startEdit(item: SmartItem, field: keyof SmartItem) {
  const nonEditable: (keyof SmartItem)[] = ['id', 'status', 'priority', 'progress']
  if (nonEditable.includes(field)) return
  editingCell.value = { id: item.id, field }
  editValue.value = String(item[field])
  nextTick(() => {
    if (editInputRef.value) {
      (editInputRef.value as HTMLInputElement | HTMLTextAreaElement).focus()
        ; (editInputRef.value as HTMLInputElement | HTMLTextAreaElement).select()
    }
  })
}

function commitEdit() {
  if (!editingCell.value) return
  const item = items.value.find(i => i.id === editingCell.value!.id)
  if (item) {
    (item as any)[editingCell.value.field] = editValue.value
  }
  editingCell.value = null
}

function cancelEdit() {
  editingCell.value = null
}

function cycleStatus(item: SmartItem) {
  const order: SmartStatus[] = ['not_started', 'on_track', 'at_risk', 'completed']
  const idx = order.indexOf(item.status)
  item.status = order[(idx + 1) % order.length]
}

function cyclePriority(item: SmartItem) {
  const order: SmartPriority[] = ['low', 'medium', 'high']
  const idx = order.indexOf(item.priority)
  item.priority = order[(idx + 1) % order.length]
}

function setProgress(item: SmartItem, e: Event) {
  item.progress = Number((e.target as HTMLInputElement).value)
}

function toggleRow(id: string) {
  if (selectedRows.value.has(id)) selectedRows.value.delete(id)
  else selectedRows.value.add(id)
}

function toggleAll() {
  if (allSelected.value) {
    filteredItems.value.forEach(i => selectedRows.value.delete(i.id))
  } else {
    filteredItems.value.forEach(i => selectedRows.value.add(i.id))
  }
}

function deleteSelected() {
  items.value = items.value.filter(i => !selectedRows.value.has(i.id))
  selectedRows.value.clear()
}

function addRow() {
  const newItem: SmartItem = {
    id: Date.now().toString(),
    title: '',
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timeBound: '',
    status: 'not_started',
    priority: 'medium',
    owner: '',
    dueDate: '',
    progress: 0,
  }
  items.value.push(newItem)
  nextTick(() => {
    startEdit(newItem, 'title')
  })
}

function toggleSort(field: keyof SmartItem) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDir.value = 'asc'
  }
}

function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="smart-page">

    <!-- ===== Page Header ===== -->
    <div class="page-header">
      <div class="page-title-row">
        <span class="page-emoji">🎯</span>
        <h1 class="page-title">SMART Goals</h1>
      </div>
      <p class="page-desc">Track, manage, and refine SMART objectives across your organization.</p>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
          <!-- Status Filter -->
          <!-- <div class="filter-chips">
            <button v-for="s in (['all', 'on_track', 'at_risk', 'completed', 'not_started'] as const)" :key="s"
              class="chip" :class="{ active: filterStatus === s }" @click="filterStatus = s">
              {{ s === 'all' ? 'All' : STATUS_CONFIG[s].label }}
            </button>
          </div> -->
        </div>

        <div class="toolbar-right">
          <button v-if="selectedRows.size > 0" class="btn btn-danger" @click="deleteSelected">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14H6L5 6" />
            </svg>
            Delete ({{ selectedRows.size }})
          </button>
          <button class="btn btn-primary" @click="addRow">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Goal
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Table ===== -->
    <div class="table-wrap">
      <table class="smart-table">
        <thead>
          <tr>
            <!-- Checkbox -->
            <th class="col-check">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" class="cb" />
            </th>

            <!-- Title -->
            <th class="col-title sortable" @click="toggleSort('title')">
              <span>Goal Title</span>
              <svg v-if="sortField === 'title'" width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5">
                <path v-if="sortDir === 'asc'" d="M12 19V5M5 12l7-7 7 7" />
                <path v-else d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </th>

            <!-- SMART fields -->
            <th v-for="f in SMART_FIELDS" :key="f.key" class="col-smart">
              <span class="smart-label">
                <span class="smart-badge">{{ f.short }}</span>
                {{ f.label }}
              </span>
            </th>

            <!-- Meta columns -->
            <th class="col-status sortable" @click="toggleSort('status')">Status</th>
            <th class="col-priority sortable" @click="toggleSort('priority')">Priority</th>
            <th class="col-owner">Owner</th>
            <th class="col-due sortable" @click="toggleSort('dueDate')">Due Date</th>
            <th class="col-progress">Progress</th>
            <th class="col-action"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredItems" :key="item.id" class="data-row"
            :class="{ selected: selectedRows.has(item.id), hovered: hoveredRow === item.id }"
            @mouseenter="hoveredRow = item.id" @mouseleave="hoveredRow = null">
            <!-- Checkbox -->
            <td class="col-check">
              <input type="checkbox" :checked="selectedRows.has(item.id)" @change="toggleRow(item.id)" class="cb" />
            </td>

            <!-- Title (editable) -->
            <td class="col-title cell-editable" @dblclick="startEdit(item, 'title')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'title'">
                <input ref="editInputRef" v-model="editValue" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="title-text">{{ item.title || 'Untitled' }}</span>
              </template>
            </td>

            <!-- SMART fields (editable) -->
            <td v-for="f in SMART_FIELDS" :key="f.key" class="col-smart cell-editable cell-truncate"
              @dblclick="startEdit(item, f.key)">
              <template v-if="editingCell?.id === item.id && editingCell?.field === f.key">
                <textarea ref="editInputRef" v-model="editValue" class="cell-textarea" rows="3" @blur="commitEdit"
                  @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="cell-text">{{ (item as any)[f.key] || '—' }}</span>
              </template>
            </td>

            <!-- Status (click to cycle) -->
            <td class="col-status">
              <button class="status-badge"
                :style="{ color: STATUS_CONFIG[item.status].color, background: STATUS_CONFIG[item.status].bg }"
                @click="cycleStatus(item)">
                {{ STATUS_CONFIG[item.status].label }}
              </button>
            </td>

            <!-- Priority (click to cycle) -->
            <td class="col-priority">
              <button class="priority-badge" @click="cyclePriority(item)">
                <span class="priority-dot" :style="{ background: PRIORITY_CONFIG[item.priority].dot }" />
                <span :style="{ color: PRIORITY_CONFIG[item.priority].color }">
                  {{ PRIORITY_CONFIG[item.priority].label }}
                </span>
              </button>
            </td>

            <!-- Owner (editable) -->
            <td class="col-owner cell-editable" @dblclick="startEdit(item, 'owner')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'owner'">
                <input ref="editInputRef" v-model="editValue" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <div v-if="item.owner" class="owner-chip">
                  <div class="owner-avatar">{{ item.owner.charAt(0) }}</div>
                  <span>{{ item.owner }}</span>
                </div>
                <span v-else class="empty-cell">—</span>
              </template>
            </td>

            <!-- Due Date (editable) -->
            <td class="col-due cell-editable" @dblclick="startEdit(item, 'dueDate')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'dueDate'">
                <input ref="editInputRef" v-model="editValue" type="date" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="date-text"
                  :class="{ overdue: item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed' }">
                  {{ formatDate(item.dueDate) }}
                </span>
              </template>
            </td>

            <!-- Progress -->
            <td class="col-progress">
              <div class="progress-wrap">
                <div class="progress-bar-bg">
                  <div class="progress-bar-fill"
                    :style="{ width: item.progress + '%', background: item.progress === 100 ? '#2e7d32' : item.progress > 50 ? '#1565c0' : '#e65100' }" />
                </div>
                <span class="progress-pct">{{ item.progress }}%</span>
              </div>
              <input type="range" min="0" max="100" :value="item.progress" class="progress-slider"
                @input="setProgress(item, $event)" />
            </td>

            <!-- Detail button -->
            <td class="col-action">
              <button class="detail-btn" @click="openDetailId = item.id" title="View Detail">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="filteredItems.length === 0">
            <td :colspan="10 + SMART_FIELDS.length" class="empty-state">
              <div class="empty-inner">
                <span class="empty-icon">🔍</span>
                <p>No goals found</p>
                <button class="btn btn-primary" @click="addRow">Add your first goal</button>
              </div>
            </td>
          </tr>
        </tbody>

        <!-- Add row footer -->
        <tfoot>
          <tr class="add-row" @click="addRow">
            <td :colspan="10 + SMART_FIELDS.length">
              <div class="add-row-inner">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New goal
              </div>
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- Count -->
      <div class="table-footer">
        <span>{{ filteredItems.length }} goal{{ filteredItems.length !== 1 ? 's' : '' }}</span>
        <span v-if="selectedRows.size > 0"> · {{ selectedRows.size }} selected</span>
      </div>
    </div>

    <!-- ===== Detail Drawer ===== -->
    <Transition name="drawer">
      <div v-if="openDetail" class="drawer-overlay" @click.self="openDetailId = null">
        <div class="drawer">
          <div class="drawer-header">
            <div class="drawer-title-row">
              <span class="drawer-emoji">🎯</span>
              <h2 class="drawer-title">{{ openDetail.title || 'Untitled' }}</h2>
            </div>
            <div class="drawer-header-meta">
              <button class="status-badge"
                :style="{ color: STATUS_CONFIG[openDetail.status].color, background: STATUS_CONFIG[openDetail.status].bg }">
                {{ STATUS_CONFIG[openDetail.status].label }}
              </button>
              <button class="icon-btn" @click="openDetailId = null">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Progress -->
          <div class="drawer-section">
            <div class="drawer-progress-row">
              <span class="drawer-label">Progress</span>
              <span class="drawer-progress-pct">{{ openDetail.progress }}%</span>
            </div>
            <div class="drawer-progress-bg">
              <div class="drawer-progress-fill"
                :style="{ width: openDetail.progress + '%', background: openDetail.progress === 100 ? '#2e7d32' : '#1565c0' }" />
            </div>
          </div>

          <!-- SMART breakdown -->
          <div class="drawer-section">
            <h3 class="drawer-section-title">SMART Breakdown</h3>
            <div class="smart-cards">
              <div v-for="f in SMART_FIELDS" :key="f.key" class="smart-card">
                <div class="smart-card-header">
                  <span class="smart-badge lg">{{ f.short }}</span>
                  <span class="smart-card-label">{{ f.label }}</span>
                </div>
                <p class="smart-card-body">{{ (openDetail as any)[f.key] || 'Not defined yet.' }}</p>
              </div>
            </div>
          </div>

          <!-- Meta -->
          <div class="drawer-section">
            <h3 class="drawer-section-title">Details</h3>
            <div class="meta-grid">
              <div class="meta-row">
                <span class="meta-key">Owner</span>
                <span class="meta-val">{{ openDetail.owner || '—' }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Due Date</span>
                <span class="meta-val">{{ formatDate(openDetail.dueDate) }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">Priority</span>
                <span class="meta-val">
                  <span class="priority-dot" :style="{ background: PRIORITY_CONFIG[openDetail.priority].dot }" />
                  {{ PRIORITY_CONFIG[openDetail.priority].label }}
                </span>
              </div>
            </div>
          </div>

          <!-- OKR placeholder -->
          <div class="drawer-section">
            <h3 class="drawer-section-title">Linked OKRs</h3>
            <div class="okr-placeholder">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span>OKR detail view coming soon</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

/* ===== Root ===== */
.smart-page {
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: #fff;
  min-height: 100vh;
  color: #1a1a1a;
  padding: 0 0 80px;
}

/* ===== Page Header ===== */
.page-header {
  padding: 48px 48px 0;
  max-width: 100%;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.page-emoji {
  font-size: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111;
}

.page-desc {
  font-size: 14px;
  color: #91918e;
  margin-bottom: 24px;
}

/* ===== Toolbar ===== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
  flex-wrap: wrap;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #f7f7f5;
  border: 1px solid #e8e8e5;
  border-radius: 7px;
  padding: 6px 12px;
  color: #91918e;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #1a1a1a;
  font-family: inherit;
  width: 160px;
}

.filter-chips {
  display: flex;
  gap: 4px;
}

.chip {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #e8e8e5;
  background: transparent;
  color: #6b6b68;
  cursor: pointer;
  transition: all 0.1s;
}

.chip:hover {
  background: #f7f7f5;
}

.chip.active {
  background: #111;
  color: #fff;
  border-color: #111;
}

.btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.1s;
}

.btn-primary {
  background: #111;
  color: #fff;
}

.btn-primary:hover {
  background: #333;
}

.btn-danger {
  background: #ffebee;
  color: #c62828;
}

.btn-danger:hover {
  background: #ffcdd2;
}

/* ===== Table Wrapper ===== */
.table-wrap {
  padding: 0 48px;
  overflow-x: auto;
}

/* ===== Table ===== */
.smart-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  table-layout: fixed;
}

/* Header */
.smart-table thead tr {
  border-bottom: 1px solid #e8e8e5;
}

.smart-table th {
  padding: 8px 10px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  color: #91918e;
  letter-spacing: 0.03em;
  white-space: nowrap;
  user-select: none;
  background: #fff;
}

.smart-table th.sortable {
  cursor: pointer;
}

.smart-table th.sortable:hover {
  color: #1a1a1a;
}

th svg {
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
}

/* Column widths */
.col-check {
  width: 36px;
}

.col-title {
  width: 200px;
  min-width: 160px;
}

.col-smart {
  width: 160px;
  min-width: 140px;
}

.col-status {
  width: 110px;
}

.col-priority {
  width: 100px;
}

.col-owner {
  width: 120px;
}

.col-due {
  width: 110px;
}

.col-progress {
  width: 130px;
}

.col-action {
  width: 40px;
}

/* Rows */
.data-row td {
  padding: 0;
  border-bottom: 1px solid #f0f0ee;
  height: 36px;
  vertical-align: middle;
}

.data-row:hover td {
  background: #fafafa;
}

.data-row.selected td {
  background: #f0f4ff;
}

/* Checkbox */
.cb {
  width: 14px;
  height: 14px;
  cursor: pointer;
  accent-color: #111;
}

td.col-check {
  padding: 0 10px;
  text-align: center;
}

/* Editable cells */
.cell-editable {
  cursor: text;
  position: relative;
}

.cell-editable:hover::after {
  content: '';
  position: absolute;
  inset: 2px;
  border: 1px solid #c8d0ff;
  border-radius: 4px;
  pointer-events: none;
}

.cell-input {
  width: 100%;
  border: none;
  outline: 2px solid #7b8aff;
  border-radius: 4px;
  padding: 4px 10px;
  font-size: 13px;
  font-family: inherit;
  background: #fff;
  box-sizing: border-box;
}

.cell-textarea {
  width: 100%;
  border: none;
  outline: 2px solid #7b8aff;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 12px;
  font-family: inherit;
  background: #fff;
  resize: vertical;
  box-sizing: border-box;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.cell-truncate {
  max-width: 160px;
  overflow: hidden;
}

.cell-text {
  display: block;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #464644;
}

.title-text {
  display: block;
  padding: 0 10px;
  font-weight: 500;
  color: #111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11.5px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  margin: 0 10px;
  transition: opacity 0.1s;
  white-space: nowrap;
  font-family: inherit;
}

.status-badge:hover {
  opacity: 0.8;
}

/* Priority */
.priority-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 0;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 12.5px;
  font-family: inherit;
  margin: 0 10px;
}

.priority-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

/* Owner */
.owner-chip {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
}

.owner-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2d7ef7, #7b4ef7);
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.empty-cell {
  padding: 0 10px;
  color: #c8c7c4;
}

/* Date */
.date-text {
  padding: 0 10px;
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #464644;
  display: block;
}

.date-text.overdue {
  color: #c62828;
}

/* Progress */
.progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 10px;
}

.progress-bar-bg {
  flex: 1;
  height: 5px;
  background: #e8e8e5;
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

.progress-pct {
  font-family: 'DM Mono', monospace;
  font-size: 11px;
  color: #91918e;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
}

.progress-slider {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  cursor: pointer;
}

td.col-progress {
  position: relative;
}

/* Detail button */
.detail-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 5px;
  color: #b5b4b0;
  transition: all 0.1s;
  opacity: 0;
}

.data-row:hover .detail-btn {
  opacity: 1;
}

.detail-btn:hover {
  background: #f0f0ee;
  color: #464644;
}

/* Smart label in header */
.smart-label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.smart-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #111;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  flex-shrink: 0;
}

.smart-badge.lg {
  width: 24px;
  height: 24px;
  border-radius: 5px;
  font-size: 13px;
}

/* Add row */
.add-row td {
  padding: 0;
  border-top: 1px solid #f0f0ee;
}

.add-row-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 48px;
  font-size: 13px;
  color: #91918e;
  cursor: pointer;
  transition: background 0.1s;
}

.add-row:hover .add-row-inner {
  background: #fafafa;
  color: #464644;
}

/* Table footer */
.table-footer {
  padding: 10px 0 0;
  font-size: 12px;
  color: #b5b4b0;
}

/* Empty state */
.empty-state {
  padding: 60px 0;
}

.empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #91918e;
}

.empty-icon {
  font-size: 32px;
}

.empty-inner p {
  font-size: 14px;
  margin: 0;
}

/* Icon button */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #91918e;
  transition: background 0.1s, color 0.1s;
}

.icon-btn:hover {
  background: #f0f0ee;
  color: #1a1a1a;
}

/* ===== Detail Drawer ===== */
.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 100;
  display: flex;
  justify-content: flex-end;
}

.drawer {
  width: 520px;
  max-width: 90vw;
  height: 100%;
  background: #fff;
  overflow-y: auto;
  padding: 0;
  box-shadow: -4px 0 32px rgba(0, 0, 0, 0.12);
  display: flex;
  flex-direction: column;
}

.drawer-header {
  position: sticky;
  top: 0;
  background: #fff;
  padding: 24px 28px 16px;
  border-bottom: 1px solid #f0f0ee;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  z-index: 1;
}

.drawer-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.drawer-emoji {
  font-size: 22px;
}

.drawer-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.01em;
  color: #111;
}

.drawer-header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.drawer-section {
  padding: 20px 28px;
  border-bottom: 1px solid #f0f0ee;
}

.drawer-section-title {
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #91918e;
  margin-bottom: 14px;
}

/* Drawer progress */
.drawer-progress-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.drawer-label {
  font-size: 13px;
  font-weight: 500;
  color: #464644;
}

.drawer-progress-pct {
  font-family: 'DM Mono', monospace;
  font-size: 13px;
  font-weight: 500;
  color: #1565c0;
}

.drawer-progress-bg {
  height: 8px;
  background: #f0f0ee;
  border-radius: 99px;
  overflow: hidden;
}

.drawer-progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* SMART cards */
.smart-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.smart-card {
  background: #fafafa;
  border: 1px solid #f0f0ee;
  border-radius: 8px;
  padding: 12px 14px;
}

.smart-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.smart-card-label {
  font-size: 12px;
  font-weight: 600;
  color: #464644;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.smart-card-body {
  font-size: 13px;
  color: #6b6b68;
  line-height: 1.6;
  margin: 0;
}

/* Meta grid */
.meta-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.meta-key {
  font-size: 12.5px;
  color: #91918e;
  width: 80px;
  flex-shrink: 0;
}

.meta-val {
  font-size: 13px;
  color: #1a1a1a;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

/* OKR placeholder */
.okr-placeholder {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  background: #f7f7f5;
  border: 1px dashed #d8d8d4;
  border-radius: 8px;
  font-size: 13px;
  color: #91918e;
}

/* ===== Transitions ===== */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}

.drawer-enter-active .drawer,
.drawer-leave-active .drawer {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}

.drawer-enter-from .drawer,
.drawer-leave-to .drawer {
  transform: translateX(100%);
}

/* ===== Scrollbar ===== */
.drawer::-webkit-scrollbar {
  width: 4px;
}

.drawer::-webkit-scrollbar-track {
  background: transparent;
}

.drawer::-webkit-scrollbar-thumb {
  background: #e8e8e5;
  border-radius: 99px;
}
</style>