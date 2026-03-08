<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

// =====================
// Types
// =====================
type SmartStatus = 'on_track' | 'at_risk' | 'completed' | 'not_started'
type SmartPriority = 'high' | 'medium' | 'low'
type OKRKeyResultStatus = 'not_started' | 'in_progress' | 'completed'
type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'

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

interface OKRItem {
  id: string
  objective: string
  keyResult: string
  status: OKRKeyResultStatus
  owner: string
  progress: number
  dueDate: string
}

interface KRItem {
  id: string
  quarter: Quarter
  title: string
  metric: string
  targetValue: string
  status: OKRKeyResultStatus
  owner: string
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

const OKR_STATUS_CONFIG: Record<OKRKeyResultStatus, { label: string; color: string; bg: string }> = {
  not_started: { label: 'Not Started', color: '#6b6b68', bg: '#f0f0ee' },
  in_progress: { label: 'In Progress', color: '#f57c00', bg: '#fff3e0' },
  completed: { label: 'Completed', color: '#1565c0', bg: '#e3f2fd' },
}

const SMART_FIELDS: { key: keyof SmartItem; label: string; short: string }[] = [
  { key: 'specific', label: 'Specific', short: 'S' },
  { key: 'measurable', label: 'Measurable', short: 'M' },
  { key: 'achievable', label: 'Achievable', short: 'A' },
  { key: 'relevant', label: 'Relevant', short: 'R' },
  { key: 'timeBound', label: 'Time-bound', short: 'T' },
]

// =====================
// Dummy Data (should come from parent or API in real app)
// =====================
const allItems = ref<SmartItem[]>([
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
// Route & Params
// =====================
const route = useRoute()
const router = useRouter()
const goalId = computed(() => route.params.id as string)
const item = computed(() => allItems.value.find(i => i.id === goalId.value) || null)

// =====================
// OKR Data
// =====================
const okrs = ref<OKRItem[]>([
  {
    id: 'okr-1',
    objective: 'Increase user engagement',
    keyResult: 'Achieve 40% weekly active user rate',
    status: 'in_progress',
    owner: 'Yuki K.',
    progress: 75,
    dueDate: '2025-09-30',
  },
  {
    id: 'okr-2',
    objective: 'Increase user engagement',
    keyResult: 'Increase average session time to 15 minutes',
    status: 'in_progress',
    owner: 'Park J.',
    progress: 55,
    dueDate: '2025-09-30',
  },
  {
    id: 'okr-3',
    objective: 'Increase user engagement',
    keyResult: 'Improve daily active user retention to 45%',
    status: 'not_started',
    owner: 'Sato M.',
    progress: 0,
    dueDate: '2025-09-30',
  },
])

// =====================
// KR Data (Key Results by Quarter)
// =====================
const krs = ref<Record<Quarter, KRItem[]>>({
  Q1: [
    {
      id: 'kr-q1-1',
      quarter: 'Q1',
      title: 'User registration growth',
      metric: 'New signups',
      targetValue: '5,000',
      status: 'completed',
      owner: 'Yuki K.',
      progress: 100,
    },
    {
      id: 'kr-q1-2',
      quarter: 'Q1',
      title: 'Product stability',
      metric: 'Uptime %',
      targetValue: '99.9%',
      status: 'in_progress',
      owner: 'Chen R.',
      progress: 85,
    },
  ],
  Q2: [
    {
      id: 'kr-q2-1',
      quarter: 'Q2',
      title: 'Revenue target',
      metric: 'Monthly recurring revenue',
      targetValue: '$50K',
      status: 'in_progress',
      owner: 'Park J.',
      progress: 62,
    },
  ],
  Q3: [
    {
      id: 'kr-q3-1',
      quarter: 'Q3',
      title: 'Market expansion',
      metric: 'New markets',
      targetValue: '3 countries',
      status: 'not_started',
      owner: 'Sato M.',
      progress: 0,
    },
  ],
  Q4: [],
})

// =====================
// OKR State
// =====================
const editingOKRCell = ref<{ id: string; field: keyof OKRItem } | null>(null)
const editOKRValue = ref('')
const editOKRInputRef = ref<HTMLElement | null>(null)
const hoveredOKRRow = ref<string | null>(null)

// =====================
// KR State
// =====================
const editingKRCell = ref<{ id: string; field: keyof KRItem; quarter: Quarter } | null>(null)
const editKRValue = ref('')
const editKRInputRef = ref<HTMLElement | null>(null)
const hoveredKRRow = ref<string | null>(null)

// =====================
// Methods
// =====================
function formatDate(d: string) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function goBack() {
  router.back()
}

function startOKREdit(okr: OKRItem, field: keyof OKRItem) {
  const nonEditable: (keyof OKRItem)[] = ['id', 'status', 'progress']
  if (nonEditable.includes(field)) return
  editingOKRCell.value = { id: okr.id, field }
  editOKRValue.value = String(okr[field])
  nextTick(() => {
    if (editOKRInputRef.value) {
      (editOKRInputRef.value as HTMLInputElement | HTMLTextAreaElement).focus()
        ; (editOKRInputRef.value as HTMLInputElement | HTMLTextAreaElement).select()
    }
  })
}

function commitOKREdit() {
  if (!editingOKRCell.value) return
  const okr = okrs.value.find(o => o.id === editingOKRCell.value!.id)
  if (okr) {
    (okr as any)[editingOKRCell.value.field] = editOKRValue.value
  }
  editingOKRCell.value = null
}

function cancelOKREdit() {
  editingOKRCell.value = null
}

function cycleOKRStatus(okr: OKRItem) {
  const order: OKRKeyResultStatus[] = ['not_started', 'in_progress', 'completed']
  const idx = order.indexOf(okr.status)
  okr.status = order[(idx + 1) % order.length]
}

function setOKRProgress(okr: OKRItem, e: Event) {
  okr.progress = Number((e.target as HTMLInputElement).value)
}

function addOKR() {
  const newOKR: OKRItem = {
    id: Date.now().toString(),
    objective: '',
    keyResult: '',
    status: 'not_started',
    owner: '',
    progress: 0,
    dueDate: '',
  }
  okrs.value.push(newOKR)
  nextTick(() => {
    startOKREdit(newOKR, 'objective')
  })
}

function deleteOKR(id: string) {
  okrs.value = okrs.value.filter(o => o.id !== id)
}

// =====================
// KR Methods
// =====================
function startKREdit(kr: KRItem, field: keyof KRItem) {
  const nonEditable: (keyof KRItem)[] = ['id', 'quarter', 'status', 'progress']
  if (nonEditable.includes(field)) return
  editingKRCell.value = { id: kr.id, field, quarter: kr.quarter }
  editKRValue.value = String(kr[field])
  nextTick(() => {
    if (editKRInputRef.value) {
      (editKRInputRef.value as HTMLInputElement | HTMLTextAreaElement).focus()
        ; (editKRInputRef.value as HTMLInputElement | HTMLTextAreaElement).select()
    }
  })
}

function commitKREdit() {
  if (!editingKRCell.value) return
  const quarter = editingKRCell.value.quarter
  const kr = krs.value[quarter]?.find(k => k.id === editingKRCell.value!.id)
  if (kr) {
    (kr as any)[editingKRCell.value.field] = editKRValue.value
  }
  editingKRCell.value = null
}

function cancelKREdit() {
  editingKRCell.value = null
}

function cycleKRStatus(kr: KRItem) {
  const order: OKRKeyResultStatus[] = ['not_started', 'in_progress', 'completed']
  const idx = order.indexOf(kr.status)
  kr.status = order[(idx + 1) % order.length]
}

function setKRProgress(kr: KRItem, e: Event) {
  kr.progress = Number((e.target as HTMLInputElement).value)
}

function addKR(quarter: Quarter) {
  const newKR: KRItem = {
    id: `kr-${quarter.toLowerCase()}-${Date.now()}`,
    quarter,
    title: '',
    metric: '',
    targetValue: '',
    status: 'not_started',
    owner: '',
    progress: 0,
  }
  krs.value[quarter].push(newKR)
  nextTick(() => {
    startKREdit(newKR, 'title')
  })
}

function deleteKR(quarter: Quarter, id: string) {
  krs.value[quarter] = krs.value[quarter].filter(k => k.id !== id)
}
</script>

<template>
  <div class="goal-detail-page">
    <!-- Header -->
    <div class="detail-header">
      <button class="back-btn" @click="goBack" title="Go back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="header-content">
        <div class="title-row">
          <span class="header-emoji">🎯</span>
          <h1 class="detail-title">{{ item?.title || 'Goal not found' }}</h1>
        </div>
        <div v-if="item" class="header-meta">
          <button class="status-badge"
            :style="{ color: STATUS_CONFIG[item.status].color, background: STATUS_CONFIG[item.status].bg }">
            {{ STATUS_CONFIG[item.status].label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div v-if="item" class="detail-content">
      <!-- Progress -->
      <div class="section">
        <div class="progress-row">
          <span class="progress-label">Progress</span>
          <span class="progress-pct">{{ item.progress }}%</span>
        </div>
        <div class="progress-bg">
          <div class="progress-fill"
            :style="{ width: item.progress + '%', background: item.progress === 100 ? '#2e7d32' : '#1565c0' }" />
        </div>
      </div>

      <!-- SMART breakdown -->
      <div class="section">
        <h2 class="section-title">SMART Breakdown</h2>
        <div class="smart-cards">
          <div v-for="f in SMART_FIELDS" :key="f.key" class="smart-card">
            <div class="smart-card-header">
              <span class="smart-badge">{{ f.short }}</span>
              <span class="smart-card-label">{{ f.label }}</span>
            </div>
            <p class="smart-card-body">{{ (item as any)[f.key] || 'Not defined yet.' }}</p>
          </div>
        </div>
      </div>

      <!-- Meta -->
      <div class="section">
        <h2 class="section-title">Details</h2>
        <div class="meta-grid">
          <div class="meta-row">
            <span class="meta-key">Owner</span>
            <span class="meta-val">{{ item.owner || '—' }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">Due Date</span>
            <span class="meta-val">{{ formatDate(item.dueDate) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-key">Priority</span>
            <span class="meta-val">
              <span class="priority-dot" :style="{ background: PRIORITY_CONFIG[item.priority].dot }" />
              {{ PRIORITY_CONFIG[item.priority].label }}
            </span>
          </div>
        </div>
      </div>

      <!-- OKR Table -->
      <div class="section">
        <div class="section-header">
          <h2 class="section-title">Key Results (OKRs)</h2>
          <button class="btn btn-primary btn-sm" @click="addOKR">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add OKR
          </button>
        </div>

        <div class="okr-table-wrap">
          <table class="okr-table">
            <thead>
              <tr>
                <th class="col-objective">Objective</th>
                <th class="col-keyresult">Key Result</th>
                <th class="col-status">Status</th>
                <th class="col-owner">Owner</th>
                <th class="col-progress">Progress</th>
                <th class="col-duedate">Due Date</th>
                <th class="col-action"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="okr in okrs" :key="okr.id" class="okr-row" :class="{ hovered: hoveredOKRRow === okr.id }"
                @mouseenter="hoveredOKRRow = okr.id" @mouseleave="hoveredOKRRow = null">
                <!-- Objective (editable) -->
                <td class="col-objective cell-editable" @dblclick="startOKREdit(okr, 'objective')">
                  <template v-if="editingOKRCell?.id === okr.id && editingOKRCell?.field === 'objective'">
                    <input ref="editOKRInputRef" v-model="editOKRValue" class="cell-input" @blur="commitOKREdit"
                      @keydown.enter="commitOKREdit" @keydown.escape="cancelOKREdit" />
                  </template>
                  <template v-else>
                    <span class="cell-text">{{ okr.objective || '—' }}</span>
                  </template>
                </td>

                <!-- Key Result (editable) -->
                <td class="col-keyresult cell-editable" @dblclick="startOKREdit(okr, 'keyResult')">
                  <template v-if="editingOKRCell?.id === okr.id && editingOKRCell?.field === 'keyResult'">
                    <textarea ref="editOKRInputRef" v-model="editOKRValue" class="cell-textarea" rows="2"
                      @blur="commitOKREdit" @keydown.escape="cancelOKREdit" />
                  </template>
                  <template v-else>
                    <span class="cell-text">{{ okr.keyResult || '—' }}</span>
                  </template>
                </td>

                <!-- Status (click to cycle) -->
                <td class="col-status">
                  <button class="okr-status-badge"
                    :style="{ color: OKR_STATUS_CONFIG[okr.status].color, background: OKR_STATUS_CONFIG[okr.status].bg }"
                    @click="cycleOKRStatus(okr)">
                    {{ OKR_STATUS_CONFIG[okr.status].label }}
                  </button>
                </td>

                <!-- Owner (editable) -->
                <td class="col-owner cell-editable" @dblclick="startOKREdit(okr, 'owner')">
                  <template v-if="editingOKRCell?.id === okr.id && editingOKRCell?.field === 'owner'">
                    <input ref="editOKRInputRef" v-model="editOKRValue" class="cell-input" @blur="commitOKREdit"
                      @keydown.enter="commitOKREdit" @keydown.escape="cancelOKREdit" />
                  </template>
                  <template v-else>
                    <span class="cell-text">{{ okr.owner || '—' }}</span>
                  </template>
                </td>

                <!-- Progress -->
                <td class="col-progress">
                  <div class="progress-mini">
                    <div class="progress-bar-mini">
                      <div class="progress-fill-mini"
                        :style="{ width: okr.progress + '%', background: okr.progress === 100 ? '#2e7d32' : '#1565c0' }" />
                    </div>
                    <span class="progress-pct-mini">{{ okr.progress }}%</span>
                  </div>
                  <input type="range" min="0" max="100" :value="okr.progress" class="progress-slider"
                    @input="setOKRProgress(okr, $event)" />
                </td>

                <!-- Due Date (editable) -->
                <td class="col-duedate cell-editable" @dblclick="startOKREdit(okr, 'dueDate')">
                  <template v-if="editingOKRCell?.id === okr.id && editingOKRCell?.field === 'dueDate'">
                    <input ref="editOKRInputRef" v-model="editOKRValue" type="date" class="cell-input"
                      @blur="commitOKREdit" @keydown.enter="commitOKREdit" @keydown.escape="cancelOKREdit" />
                  </template>
                  <template v-else>
                    <span class="cell-text">{{ formatDate(okr.dueDate) }}</span>
                  </template>
                </td>

                <!-- Delete button -->
                <td class="col-action">
                  <button class="delete-btn" @click="deleteOKR(okr.id)" title="Delete">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="okrs.length === 0">
                <td colspan="7" class="empty-state">
                  <div class="empty-inner">
                    <p>No OKRs yet</p>
                    <button class="btn btn-primary" @click="addOKR">Add your first OKR</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Count -->
        <div class="table-footer">
          <span>{{ okrs.length }} OKR{{ okrs.length !== 1 ? 's' : '' }}</span>
        </div>
      </div>

      <!-- KR by Quarter -->
      <div class="section">
        <h2 class="section-title">Key Results by Quarter</h2>

        <!-- Q1, Q2, Q3, Q4 Sections -->
        <div v-for="quarter in ['Q1', 'Q2', 'Q3', 'Q4']" :key="quarter" class="quarter-section">
          <div class="quarter-header">
            <h3 class="quarter-title">{{ quarter }}</h3>
            <button class="btn btn-primary btn-sm" @click="addKR(quarter as Quarter)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add KR
            </button>
          </div>

          <div class="kr-table-wrap">
            <table class="kr-table">
              <thead>
                <tr>
                  <th class="col-kr-title">Title</th>
                  <th class="col-kr-metric">Metric</th>
                  <th class="col-kr-target">Target Value</th>
                  <th class="col-kr-status">Status</th>
                  <th class="col-kr-owner">Owner</th>
                  <th class="col-kr-progress">Progress</th>
                  <th class="col-kr-action"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="kr in krs[quarter as Quarter]" :key="kr.id" class="kr-row"
                  :class="{ hovered: hoveredKRRow === kr.id }" @mouseenter="hoveredKRRow = kr.id"
                  @mouseleave="hoveredKRRow = null">
                  <!-- Title (editable) -->
                  <td class="col-kr-title cell-editable" @dblclick="startKREdit(kr, 'title')">
                    <template v-if="editingKRCell?.id === kr.id && editingKRCell?.field === 'title'">
                      <input ref="editKRInputRef" v-model="editKRValue" class="cell-input" @blur="commitKREdit"
                        @keydown.enter="commitKREdit" @keydown.escape="cancelKREdit" />
                    </template>
                    <template v-else>
                      <span class="cell-text">{{ kr.title || '—' }}</span>
                    </template>
                  </td>

                  <!-- Metric (editable) -->
                  <td class="col-kr-metric cell-editable" @dblclick="startKREdit(kr, 'metric')">
                    <template v-if="editingKRCell?.id === kr.id && editingKRCell?.field === 'metric'">
                      <input ref="editKRInputRef" v-model="editKRValue" class="cell-input" @blur="commitKREdit"
                        @keydown.enter="commitKREdit" @keydown.escape="cancelKREdit" />
                    </template>
                    <template v-else>
                      <span class="cell-text">{{ kr.metric || '—' }}</span>
                    </template>
                  </td>

                  <!-- Target Value (editable) -->
                  <td class="col-kr-target cell-editable" @dblclick="startKREdit(kr, 'targetValue')">
                    <template v-if="editingKRCell?.id === kr.id && editingKRCell?.field === 'targetValue'">
                      <input ref="editKRInputRef" v-model="editKRValue" class="cell-input" @blur="commitKREdit"
                        @keydown.enter="commitKREdit" @keydown.escape="cancelKREdit" />
                    </template>
                    <template v-else>
                      <span class="cell-text">{{ kr.targetValue || '—' }}</span>
                    </template>
                  </td>

                  <!-- Status (click to cycle) -->
                  <td class="col-kr-status">
                    <button class="kr-status-badge"
                      :style="{ color: OKR_STATUS_CONFIG[kr.status].color, background: OKR_STATUS_CONFIG[kr.status].bg }"
                      @click="cycleKRStatus(kr)">
                      {{ OKR_STATUS_CONFIG[kr.status].label }}
                    </button>
                  </td>

                  <!-- Owner (editable) -->
                  <td class="col-kr-owner cell-editable" @dblclick="startKREdit(kr, 'owner')">
                    <template v-if="editingKRCell?.id === kr.id && editingKRCell?.field === 'owner'">
                      <input ref="editKRInputRef" v-model="editKRValue" class="cell-input" @blur="commitKREdit"
                        @keydown.enter="commitKREdit" @keydown.escape="cancelKREdit" />
                    </template>
                    <template v-else>
                      <span class="cell-text">{{ kr.owner || '—' }}</span>
                    </template>
                  </td>

                  <!-- Progress -->
                  <td class="col-kr-progress">
                    <div class="progress-mini">
                      <div class="progress-bar-mini">
                        <div class="progress-fill-mini"
                          :style="{ width: kr.progress + '%', background: kr.progress === 100 ? '#2e7d32' : '#1565c0' }" />
                      </div>
                      <span class="progress-pct-mini">{{ kr.progress }}%</span>
                    </div>
                    <input type="range" min="0" max="100" :value="kr.progress" class="progress-slider"
                      @input="setKRProgress(kr, $event)" />
                  </td>

                  <!-- Delete button -->
                  <td class="col-kr-action">
                    <button class="delete-btn" @click="deleteKR(quarter as Quarter, kr.id)" title="Delete">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14H6L5 6" />
                      </svg>
                    </button>
                  </td>
                </tr>

                <!-- Empty state -->
                <tr v-if="krs[quarter as Quarter].length === 0">
                  <td colspan="7" class="empty-state">
                    <div class="empty-inner-sm">
                      <p>No KRs for this quarter</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Count -->
          <div class="table-footer-sm">
            <span>{{ krs[quarter as Quarter].length }} KR{{ krs[quarter as Quarter].length !== 1 ? 's' : ''
            }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="not-found">
      <p>Goal not found</p>
      <button class="btn btn-primary" @click="goBack">Go back</button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

.goal-detail-page {
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: #fff;
  min-height: 100vh;
  padding: 40px 20px;
}

/* ===== Header ===== */
.detail-header {
  max-width: 1000px;
  margin: 0 auto 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0ee;
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.back-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b6b68;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #2b2b2a;
}

.header-content {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.header-emoji {
  font-size: 28px;
}

.detail-title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
  color: #2b2b2a;
  word-break: break-word;
}

.header-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.status-badge {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.status-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* ===== Content ===== */
.detail-content {
  max-width: 1000px;
  margin: 0 auto;
}

.section {
  margin-bottom: 40px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6b6b68;
  margin: 0 0 16px 0;
}

/* Progress */
.progress-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 13px;
  color: #6b6b68;
  font-weight: 500;
}

.progress-pct {
  font-size: 18px;
  font-weight: 600;
  color: #2b2b2a;
}

.progress-bg {
  width: 100%;
  height: 8px;
  background: #f0f0ee;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

/* SMART Cards */
.smart-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.smart-card {
  padding: 16px;
  background: #fafaf8;
  border: 1px solid #f0f0ee;
  border-radius: 8px;
  transition: all 0.2s;
}

.smart-card:hover {
  border-color: #e0e0dc;
  background: #fdfcfb;
}

.smart-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.smart-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #1565c0;
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.smart-card-label {
  font-size: 13px;
  font-weight: 600;
  color: #2b2b2a;
}

.smart-card-body {
  font-size: 13px;
  line-height: 1.5;
  color: #6b6b68;
  margin: 0;
}

/* Meta */
.meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.meta-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-key {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #999;
  font-weight: 600;
}

.meta-val {
  font-size: 14px;
  color: #2b2b2a;
  display: flex;
  align-items: center;
  gap: 6px;
}

.priority-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

/* OKR Placeholder */
.okr-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  background: #fafaf8;
  border: 1px dashed #e0e0dc;
  border-radius: 8px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.okr-placeholder svg {
  opacity: 0.5;
}

/* Not Found */
.not-found {
  max-width: 800px;
  margin: 100px auto;
  text-align: center;
}

.not-found p {
  font-size: 16px;
  color: #6b6b68;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1565c0;
  color: white;
}

.btn-primary:hover {
  background: #1460b0;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
}

.btn-primary:active {
  transform: scale(0.98);
}

/* OKR Table */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-family: inherit;
  transition: all 0.2s;
}

.btn-primary {
  background: #1565c0;
  color: white;
}

.btn-primary:hover {
  background: #1460b0;
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.2);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.okr-table-wrap {
  overflow-x: auto;
  margin-bottom: 12px;
}

.okr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.okr-table thead tr {
  border-bottom: 1px solid #e8e8e5;
}

.okr-table th {
  padding: 8px 10px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  color: #91918e;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: #fff;
}

.okr-table td {
  padding: 0;
  border-bottom: 1px solid #f0f0ee;
  height: 36px;
  vertical-align: middle;
}

.okr-row:hover td {
  background: #fafafa;
}

.col-objective {
  width: 180px;
}

.col-keyresult {
  width: 220px;
}

.col-status {
  width: 110px;
}

.col-owner {
  width: 100px;
}

.col-progress {
  width: 120px;
}

.col-duedate {
  width: 100px;
}

.col-action {
  width: 40px;
}

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

.cell-text {
  display: block;
  padding: 0 10px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #464644;
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

.okr-status-badge {
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
  font-family: inherit;
}

.okr-status-badge:hover {
  opacity: 0.8;
}

/* Progress mini */
.progress-mini {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  position: relative;
}

.progress-bar-mini {
  flex: 1;
  height: 4px;
  background: #e8e8e5;
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  border-radius: 99px;
  transition: width 0.3s ease;
}

.progress-pct-mini {
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

.delete-btn {
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

.okr-row:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: #ffebee;
  color: #c62828;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.empty-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #91918e;
}

.empty-inner p {
  font-size: 14px;
  margin: 0;
}

.table-footer {
  padding: 10px 0 0;
  font-size: 12px;
  color: #b5b4b0;
}

/* Quarter Section */
.quarter-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #fafaf8;
  border: 1px solid #f0f0ee;
  border-radius: 8px;
}

.quarter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}

.quarter-title {
  font-size: 16px;
  font-weight: 600;
  color: #2b2b2a;
  margin: 0;
}

/* KR Table */
.kr-table-wrap {
  overflow-x: auto;
  margin-bottom: 12px;
  background: #fff;
  border-radius: 6px;
}

.kr-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.kr-table thead tr {
  border-bottom: 1px solid #e8e8e5;
}

.kr-table th {
  padding: 8px 10px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 600;
  color: #91918e;
  letter-spacing: 0.03em;
  white-space: nowrap;
  background: #fff;
}

.kr-table td {
  padding: 0;
  border-bottom: 1px solid #f0f0ee;
  height: 36px;
  vertical-align: middle;
}

.kr-row:hover td {
  background: #fafafa;
}

.col-kr-title {
  width: 140px;
}

.col-kr-metric {
  width: 120px;
}

.col-kr-target {
  width: 110px;
}

.col-kr-status {
  width: 110px;
}

.col-kr-owner {
  width: 100px;
}

.col-kr-progress {
  width: 120px;
}

.col-kr-action {
  width: 40px;
}

.kr-status-badge {
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
  font-family: inherit;
}

.kr-status-badge:hover {
  opacity: 0.8;
}

.table-footer-sm {
  padding: 8px 0 0;
  font-size: 12px;
  color: #b5b4b0;
}

.empty-inner-sm {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #91918e;
  padding: 20px 0;
  text-align: center;
}

.empty-inner-sm p {
  font-size: 13px;
  margin: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .goal-detail-page {
    padding: 20px 16px;
  }

  .detail-header {
    margin-bottom: 30px;
  }

  .detail-title {
    font-size: 22px;
  }

  .smart-cards {
    grid-template-columns: 1fr;
  }

  .meta-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
</style>
