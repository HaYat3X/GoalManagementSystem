<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { Target } from 'lucide-vue-next';

// =====================
// Types
// =====================
type SmartStatus = 'Planning' | 'Active' | 'Completed'
type SmartCategory = 'Career' | 'Skill' | 'Finance' | 'Life'

interface SmartItem {
  id: string
  title: string
  category: SmartCategory
  specific: string
  measurable: string
  achievable: string
  relevant: string
  timeBound: string
  startDate: string
  targetYear: number
  status: SmartStatus
  progress: number
  yearPlans: string[] // Relation to YearPlan DB
}

// =====================
// Constants
// =====================
const STATUS_CONFIG: Record<SmartStatus, { label: string; color: string; bg: string }> = {
  Planning: { label: 'Planning', color: '#6b6b68', bg: '#f0f0ee' },
  Active: { label: 'Active', color: '#1565c0', bg: '#e3f2fd' },
  Completed: { label: 'Completed', color: '#2e7d32', bg: '#e8f5e9' },
}

const CATEGORY_CONFIG: Record<SmartCategory, { label: string; color: string; bg: string }> = {
  Career: { label: 'Career', color: '#2e7d32', bg: '#e8f5e9' },
  Skill: { label: 'Skill', color: '#1565c0', bg: '#e3f2fd' },
  Finance: { label: 'Finance', color: '#e65100', bg: '#ffebee' },
  Life: { label: 'Life', color: '#6b6b68', bg: '#f0f0ee' },
}

const SMART_FIELDS: { key: keyof SmartItem; label: string; short: string }[] = [
  { key: 'specific', label: 'Specific', short: 'S' },
  { key: 'measurable', label: 'Measurable', short: 'M' },
  { key: 'achievable', label: 'Achievable', short: 'A' },
  { key: 'relevant', label: 'Relevant', short: 'R' },
]

// =====================
// Data
// =====================
const items = ref<SmartItem[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Notionからデータを取得
async function fetchNotionData() {
  try {
    loading.value = true
    error.value = null
    const response = await $fetch('/api/getSmart')
    if (response.success) {
      // APIからすでに整形されたデータが返ってくる
      items.value = response.data
    }
  } catch (err) {
    error.value = 'Notionデータの取得に失敗しました'
    console.error('Error fetching Notion data:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchNotionData()
})

// =====================
// State
// =====================
const editingCell = ref<{ id: string; field: keyof SmartItem } | null>(null)
const editValue = ref('')
const editInputRef = ref<HTMLElement | null>(null)
const hoveredRow = ref<string | null>(null)
const selectedRows = ref<Set<string>>(new Set())
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

const allSelected = computed(() =>
  filteredItems.value.length > 0 &&
  filteredItems.value.every(i => selectedRows.value.has(i.id))
)

// =====================
// Methods
// =====================
function startEdit(item: SmartItem, field: keyof SmartItem) {
  const nonEditable: (keyof SmartItem)[] = ['id', 'status', 'category', 'progress', 'yearPlans']
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

async function commitEdit() {
  if (!editingCell.value) return

  const { id, field } = editingCell.value
  const item = items.value.find(i => i.id === id)

  if (!item) return

  const newValue = editValue.value

  try {
    await $fetch('/api/updateSmart', {
      method: 'POST',
      body: {
        id,
        field,
        value: newValue
      }
    })

      ; (item as any)[field] = newValue
  } catch (err) {
    console.error('Update failed', err)
  }

  editingCell.value = null
}

function cancelEdit() {
  editingCell.value = null
}

async function cycleStatus(item: SmartItem) {
  const order: SmartStatus[] = ['Planning', 'Active', 'Completed']
  const idx = order.indexOf(item.status)
  const newStatus = order[(idx + 1) % order.length]

  item.status = newStatus

  try {
    await $fetch('/api/updateSmart', {
      method: 'POST',
      body: {
        id: item.id,
        field: 'status',
        value: newStatus
      }
    })
  } catch (err) {
    console.error('status update failed', err)
  }
}

async function cycleCategory(item: SmartItem) {
  const order: SmartCategory[] = ['Career', 'Skill', 'Finance', 'Life']
  const idx = order.indexOf(item.category)
  const newCategory = order[(idx + 1) % order.length]

  item.category = newCategory

  try {
    await $fetch('/api/updateSmart', {
      method: 'POST',
      body: {
        id: item.id,
        field: 'category',
        value: newCategory
      }
    })
  } catch (err) {
    console.error('category update failed', err)
  }
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

async function deleteSelected() {
  const ids = Array.from(selectedRows.value)

  try {
    await $fetch('/api/deleteSmart', {
      method: 'POST',
      body: {
        ids
      }
    })

    items.value = items.value.filter(i => !selectedRows.value.has(i.id))
    selectedRows.value.clear()

  } catch (err) {
    console.error('delete failed', err)
  }
}

// function addRow() {
//   const newItem: SmartItem = {
//     id: Date.now().toString(),
//     title: '',
//     category: 'Career',
//     specific: '',
//     measurable: '',
//     achievable: '',
//     relevant: '',
//     timeBound: '',
//     startDate: '',
//     targetYear: new Date().getFullYear(),
//     status: 'Planning',
//     progress: 0,
//     yearPlans: [],
//   }
//   items.value.push(newItem)
//   nextTick(() => {
//     startEdit(newItem, 'title')
//   })
// }
async function addRow() {

  try {

    const response = await $fetch('/api/createSmart', {
      method: 'POST',
      body: {
        title: 'New Goal',
        category: 'Career'
      }
    })

    const newItem: SmartItem = {
      id: response.id,
      title: '',
      category: 'Career',
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: '',
      startDate: '',
      targetYear: new Date().getFullYear(),
      status: 'Planning',
      progress: 0,
      yearPlans: []
    }

    items.value.push(newItem)

    nextTick(() => {
      startEdit(newItem, 'title')
    })

  } catch (err) {
    console.error('create failed', err)
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
        <Target class="page-icon" />
        <h1 class="page-title">Smart Goals</h1>
      </div>

      <!-- Toolbar -->
      <div class="toolbar">
        <div class="toolbar-left">
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

    <!-- Loading and Error States -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Notionからデータを読み込み中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-primary" @click="fetchNotionData">再試行</button>
    </div>

    <!-- ===== Table ===== -->
    <div v-else class="table-wrap">
      <table class="smart-table">
        <thead>
          <tr>
            <!-- Checkbox -->
            <th class="col-check">
              <input type="checkbox" :checked="allSelected" @change="toggleAll" class="cb" />
            </th>

            <!-- Status -->
            <th class="col-status">Status</th>

            <!-- Goal Title -->
            <th class="col-title">Goal Title</th>

            <!-- Category -->
            <th class="col-category">Category</th>

            <!-- SMART fields -->
            <th v-for="f in SMART_FIELDS" :key="f.key" class="col-smart">
              {{ f.label }}
            </th>

            <!-- TimeBound -->
            <th class="col-timebound">Target Date</th>

            <!-- StartDate -->
            <th class="col-startdate">Start Date</th>

            <!-- TargetYear -->
            <th class="col-targetyear">Target Year</th>

            <!-- Progress -->
            <th class="col-progress">Progress</th>

            <!-- YearPlans -->
            <th class="col-yearplans">Year Plans</th>
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

            <!-- Status (click to cycle) -->
            <td class="col-status">
              <button class="status-badge"
                :style="{ color: STATUS_CONFIG[item.status].color, background: STATUS_CONFIG[item.status].bg }"
                @click="cycleStatus(item)">
                {{ STATUS_CONFIG[item.status].label }}
              </button>
            </td>

            <!-- Goal Title (editable) -->
            <td class="col-title cell-editable" @dblclick="startEdit(item, 'title')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'title'">
                <input ref="editInputRef" v-model="editValue" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="title-text">{{ item.title || 'Untitled' }}</span>
              </template>
            </td>

            <!-- Category (click to cycle) -->
            <td class="col-category">
              <button class="category-badge"
                :style="{ color: CATEGORY_CONFIG[item.category].color, background: CATEGORY_CONFIG[item.category].bg }"
                @click="cycleCategory(item)">
                {{ CATEGORY_CONFIG[item.category].label }}
              </button>
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

            <!-- TimeBound (editable) -->
            <td class="col-timebound cell-editable" @dblclick="startEdit(item, 'timeBound')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'timeBound'">
                <input ref="editInputRef" v-model="editValue" type="date" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="date-text"
                  :class="{ overdue: item.timeBound && new Date(item.timeBound) < new Date() && item.status !== 'Completed' }">
                  {{ formatDate(item.timeBound) }}
                </span>
              </template>
            </td>

            <!-- StartDate (editable) -->
            <td class="col-startdate cell-editable" @dblclick="startEdit(item, 'startDate')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'startDate'">
                <input ref="editInputRef" v-model="editValue" type="date" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="date-text">{{ formatDate(item.startDate) }}</span>
              </template>
            </td>

            <!-- TargetYear (editable) -->
            <td class="col-targetyear cell-editable" @dblclick="startEdit(item, 'targetYear')">
              <template v-if="editingCell?.id === item.id && editingCell?.field === 'targetYear'">
                <input ref="editInputRef" v-model="editValue" type="number" class="cell-input" @blur="commitEdit"
                  @keydown.enter="commitEdit" @keydown.escape="cancelEdit" />
              </template>
              <template v-else>
                <span class="year-text">{{ item.targetYear || '—' }}</span>
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
            </td>

            <!-- YearPlans -->
            <td class="col-yearplans">
              <span class="yearplans-count">{{ item.yearPlans.length }}</span>
            </td>
          </tr>

          <!-- Empty state -->
          <tr v-if="filteredItems.length === 0">
            <td :colspan="13" class="empty-state">
              <div class="empty-inner">
                <span class="empty-icon">🔍</span>
                <p>No goals found</p>
                <button class="btn btn-primary" @click="addRow">Add your first goal</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Count -->
      <div class="table-footer">
        <span>{{ filteredItems.length }} goal{{ filteredItems.length !== 1 ? 's' : '' }}</span>
        <span v-if="selectedRows.size > 0"> · {{ selectedRows.size }} selected</span>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* ===== Root ===== */
.smart-page {
  background: #fff;
  min-height: 100vh;
  color: #1a1a1a;
  padding: 0 0 80px;
}

/* ===== Page Header ===== */
.page-header {
  padding: 20px 48px 0;
  max-width: 100%;
}

.page-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-start;
}

.page-icon {
  color: #1a1a1a;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111;
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

.col-category {
  width: 100px;
}

.col-smart {
  width: 320px;
  min-width: 300px;
}

.col-timebound {
  width: 110px;
}

.col-startdate {
  width: 110px;
}

.col-targetyear {
  width: 100px;
}

.col-status {
  width: 110px;
}

.col-progress {
  width: 130px;
}

.col-yearplans {
  width: 100px;
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
  padding: 6px 10px;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
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

/* Category badge */
.category-badge {
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

.category-badge:hover {
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
  font-size: 12px;
  color: #464644;
  display: block;
}

.date-text.overdue {
  color: #c62828;
}

/* Year */
.year-text {
  padding: 0 10px;
  font-size: 12px;
  color: #464644;
  display: block;
}

/* Year Plans */
.yearplans-count {
  padding: 0 10px;
  font-size: 12px;
  color: #464644;
  display: block;
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
  font-size: 11px;
  color: #91918e;
  width: 30px;
  text-align: right;
  flex-shrink: 0;
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