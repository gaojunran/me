<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import WakaTimeHeatmap from './WakaTimeHeatmap.vue'
import WakaTimeStatCard from './WakaTimeStatCard.vue'

interface WakaTimeData {
  data: {
    categories: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    languages: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    projects: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    editors: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    operating_systems: Array<{
      name: string
      total_seconds: number
      percent: number
      digital: string
      text: string
      hours: number
      minutes: number
    }>
    grand_total: {
      total_seconds: number
      digital: string
      text: string
      hours: number
      minutes: number
    }
    range: {
      start: string
      end: string
      date: string
      text: string
      timezone: string
    }
  }
}

interface DayData {
  date: string
  total_seconds: number
  level: number
}

const loading = ref(true)
const error = ref('')
const stats = ref<WakaTimeData | null>(null)
const last7Days = ref<DayData[]>([])
const last30Days = ref<DayData[]>([])

// Generate last 365 days for heatmap
const heatmapData = ref<DayData[]>([])

// Get activity level based on seconds (0-4)
function getActivityLevel(seconds: number): number {
  if (seconds === 0) return 0
  if (seconds < 3600) return 1 // < 1 hour
  if (seconds < 7200) return 2 // < 2 hours
  if (seconds < 14400) return 3 // < 4 hours
  return 4 // >= 4 hours
}

// Format seconds to readable time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Fetch WakaTime data via Netlify Functions
async function fetchWakaTimeData() {
  try {
    loading.value = true
    error.value = ''

    // Fetch last 30 days stats via Netlify Function
    const last30DaysStatsResponse = await fetch(
      '/.netlify/functions/wakatime?endpoint=users/current/stats/last_30_days',
    )

    if (!last30DaysStatsResponse.ok) {
      const errorData = await last30DaysStatsResponse.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to fetch WakaTime data. Please check your API key in Netlify environment variables.')
    }

    stats.value = await last30DaysStatsResponse.json()

    // Fetch summaries for heatmap (last 30 days)
    const endDate = dayjs()
    const startDate = endDate.subtract(30, 'day')

    const summariesResponse = await fetch(
      `/.netlify/functions/wakatime?endpoint=users/current/summaries&start=${startDate.format('YYYY-MM-DD')}&end=${endDate.format('YYYY-MM-DD')}`,
    )

    if (summariesResponse.ok) {
      const summariesData = await summariesResponse.json()
      
      // Debug: Print summaries API response
      console.log('=== Summaries API Response ===')
      console.log('Full response:', summariesData)
      console.log('Data array length:', summariesData.data?.length)
      if (summariesData.data?.length > 0) {
        console.log('First day sample:', summariesData.data[0])
        console.log('Last day sample:', summariesData.data[summariesData.data.length - 1])
      }
      console.log('==============================')
      
      const dataMap = new Map<string, number>()

      // Process summaries data
      summariesData.data.forEach((day: any) => {
        // Calculate total_seconds from hours and minutes since the API doesn't provide total_seconds
        const totalSeconds = (day.grand_total.hours * 3600) + (day.grand_total.minutes * 60)
        // Extract date from range.start (format: 2025-11-23T00:00:00+08:00 -> 2025-11-23)
        const dateStr = day.range.start.split('T')[0]
        dataMap.set(dateStr, totalSeconds)
      })

      // Generate 30 days data
      const days: DayData[] = []
      for (let i = 29; i >= 0; i--) {
        const date = endDate.subtract(i, 'day').format('YYYY-MM-DD')
        const totalSeconds = dataMap.get(date) || 0
        days.push({
          date,
          total_seconds: totalSeconds,
          level: getActivityLevel(totalSeconds),
        })
      }

      heatmapData.value = days

      // Get last 7 and 30 days
      last7Days.value = days.slice(-7)
      last30Days.value = days
      
      // Debug: Print processed data
      console.log('=== Processed Data ===')
      console.log('Last 7 days:', last7Days.value)
      console.log('Last 30 days total seconds:', last30Days.value.reduce((sum, day) => sum + day.total_seconds, 0))
      console.log('Today data:', last7Days.value[last7Days.value.length - 1])
      console.log('======================')
    }
  }
  catch (err: any) {
    error.value = err.message || 'Failed to fetch WakaTime data'
    console.error('WakaTime fetch error:', err)
  }
  finally {
    loading.value = false
  }
}

// Prepare data for stat cards
const languagesData = computed(() => {
  if (!stats.value) return []
  return stats.value.data.languages.map(lang => ({
    name: lang.name,
    value: lang.text,
    percent: lang.percent,
  }))
})

const projectsData = computed(() => {
  if (!stats.value) return []
  return stats.value.data.projects.map(project => ({
    name: project.name,
    value: project.text,
    percent: project.percent,
  }))
})

const categoriesData = computed(() => {
  if (!stats.value) return []
  return stats.value.data.categories.map(category => ({
    name: category.name,
    value: category.text,
    percent: category.percent,
  }))
})

// Calculate total time for last 7 and 30 days
const last7DaysTotal = computed(() => {
  const total = last7Days.value.reduce((sum, day) => sum + day.total_seconds, 0)
  return formatTime(total)
})

const last30DaysTotal = computed(() => {
  // Use stats API data for last 30 days
  if (stats.value?.data?.grand_total) {
    const totalSeconds = (stats.value.data.grand_total.hours * 3600) + (stats.value.data.grand_total.minutes * 60)
    return formatTime(totalSeconds)
  }
  const total = last30Days.value.reduce((sum, day) => sum + day.total_seconds, 0)
  return formatTime(total)
})

const dailyAverage = computed(() => {
  // Use stats API data for daily average (30 days)
  if (stats.value?.data?.grand_total) {
    const totalSeconds = (stats.value.data.grand_total.hours * 3600) + (stats.value.data.grand_total.minutes * 60)
    // Only count days with coding activity (exclude days with 0 seconds)
    const activeDays = last30Days.value.filter(day => day.total_seconds > 0).length
    if (activeDays === 0) return '0m'
    const avgSeconds = Math.floor(totalSeconds / activeDays)
    return formatTime(avgSeconds)
  }
  if (last30Days.value.length === 0) return '0m'
  const total = last30Days.value.reduce((sum, day) => sum + day.total_seconds, 0)
  const activeDays = last30Days.value.filter(day => day.total_seconds > 0).length
  if (activeDays === 0) return '0m'
  return formatTime(Math.floor(total / activeDays))
})

const todayTotal = computed(() => {
  // Try to get today's data from last7Days first
  const today = last7Days.value[last7Days.value.length - 1]
  if (today?.total_seconds) {
    return formatTime(today.total_seconds)
  }
  return '0m'
})

onMounted(() => {
  fetchWakaTimeData()
})
</script>

<template>
  <div class="wakatime-stats">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="i-mdi:loading animate-spin text-4xl" />
      <p>Loading WakaTime data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <div class="i-mdi:alert-circle text-4xl text-red-500" />
      <p>{{ error }}</p>
      <p class="text-sm op50 mt-2">
        Make sure WAKATIME_API_KEY is set in Netlify environment variables.
        <a href="https://wakatime.com/settings/account" target="_blank" class="text-blue-500 hover:underline">
          Get your API key
        </a>
      </p>
    </div>

    <!-- Main Content -->
    <div v-else-if="stats" class="stats-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="card">
          <div class="card-icon i-mdi:clock-outline" />
          <div class="card-content">
            <div class="card-label">Last 7 Days</div>
            <div class="card-value">{{ last7DaysTotal }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon i-mdi:calendar-month" />
          <div class="card-content">
            <div class="card-label">Last 30 Days</div>
            <div class="card-value">{{ last30DaysTotal }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon i-mdi:chart-line" />
          <div class="card-content">
            <div class="card-label">Daily Average</div>
            <div class="card-value">{{ dailyAverage }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-icon i-mdi:calendar-today" />
          <div class="card-content">
            <div class="card-label">Today</div>
            <div class="card-value">{{ todayTotal }}</div>
          </div>
        </div>
      </div>

      <!-- GitHub-style Contribution Heatmap -->
      <WakaTimeHeatmap :data="heatmapData" />

      <!-- Languages Chart -->
      <WakaTimeStatCard
        title="Top Languages"
        icon="i-mdi:code-tags"
        :items="languagesData"
        :max-items="8"
      />

      <!-- Projects Chart -->
      <WakaTimeStatCard
        title="Top Projects"
        icon="i-mdi:folder-outline"
        :items="projectsData"
        :max-items="8"
      />

      <!-- Categories Chart -->
      <WakaTimeStatCard
        title="Categories"
        icon="i-mdi:shape-outline"
        :items="categoriesData"
        :max-items="8"
      />
    </div>
  </div>
</template>

<style scoped>
.wakatime-stats {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem 2rem;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  opacity: 0.7;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(125, 125, 125, 0.05);
  border: 1px solid rgba(125, 125, 125, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.card:hover {
  background: rgba(125, 125, 125, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-icon {
  font-size: 2rem;
  opacity: 0.6;
}

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  opacity: 0.6;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Dark mode adjustments */
.dark .card {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .card:hover {
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 768px) {
  .wakatime-stats {
    padding: 1rem 0.5rem;
  }

  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .card {
    padding: 1rem;
  }

  .card-value {
    font-size: 1.25rem;
  }
}
</style>
