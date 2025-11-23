<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

interface DayData {
  date: string
  total_seconds: number
  level: number
}

const props = defineProps<{
  data: DayData[]
}>()

// Format seconds to readable time
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}

// Group heatmap data by weeks for calendar view (horizontal layout)
const heatmapWeeks = computed(() => {
  const weeks: DayData[][] = []
  let currentWeek: DayData[] = []

  if (props.data.length === 0) return weeks

  // Add empty days at the beginning to align with Sunday (0) to Saturday (6)
  const firstDay = dayjs(props.data[0]?.date)
  const firstDayOfWeek = firstDay.day() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

  // Fill empty days before the first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({
      date: '',
      total_seconds: 0,
      level: 0,
    })
  }

  // Add all data days
  props.data.forEach((day) => {
    currentWeek.push(day)

    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  // Fill remaining days in the last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({
        date: '',
        total_seconds: 0,
        level: 0,
      })
    }
    weeks.push(currentWeek)
  }

  return weeks
})

// Get date range for display
const dateRange = computed(() => {
  if (props.data.length === 0) return ''
  const firstDay = dayjs(props.data[0]?.date)
  const lastDay = dayjs(props.data[props.data.length - 1]?.date)
  return `${firstDay.format('MMM D')} - ${lastDay.format('MMM D, YYYY')}`
})
</script>

<template>
  <div class="heatmap-container">
    <div class="heatmap-header">
      <h3 class="heatmap-title">
        <div class="i-mdi:calendar-heat mr-2" />
        Last 30 Days
      </h3>
      <div class="date-range">{{ dateRange }}</div>
    </div>

    <div class="heatmap-wrapper">
      <!-- Weekday headers (horizontal) -->
      <div class="weekday-headers">
        <div class="weekday-header">Sun</div>
        <div class="weekday-header">Mon</div>
        <div class="weekday-header">Tue</div>
        <div class="weekday-header">Wed</div>
        <div class="weekday-header">Thu</div>
        <div class="weekday-header">Fri</div>
        <div class="weekday-header">Sat</div>
      </div>

      <!-- Calendar grid (weeks as rows, days as columns) -->
      <div class="calendar-grid">
        <div v-for="(week, weekIndex) in heatmapWeeks" :key="weekIndex" class="calendar-week">
          <div
            v-for="(day, dayIndex) in week"
            :key="dayIndex"
            class="calendar-day"
            :class="[`level-${day.level}`, { empty: !day.date }]"
            :title="day.date ? `${dayjs(day.date).format('MMM D, YYYY')}: ${formatTime(day.total_seconds)}` : ''"
          >
            <span v-if="day.date" class="day-number">{{ dayjs(day.date).format('D') }}</span>
          </div>
        </div>
      </div>

      <div class="heatmap-legend">
        <span class="legend-label">Less</span>
        <div class="legend-item level-0" />
        <div class="legend-item level-1" />
        <div class="legend-item level-2" />
        <div class="legend-item level-3" />
        <div class="legend-item level-4" />
        <span class="legend-label">More</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.heatmap-container {
  padding: 1.25rem;
  background: rgba(125, 125, 125, 0.05);
  border: 1px solid rgba(125, 125, 125, 0.1);
  border-radius: 12px;
}

.heatmap-header {
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.heatmap-title {
  display: flex;
  align-items: center;
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 0;
}

.date-range {
  font-size: 0.875rem;
  opacity: 0.6;
  font-weight: 500;
}

.heatmap-wrapper {
  width: 100%;
}

/* Weekday headers */
.weekday-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday-header {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0.6;
  padding: 0.25rem 0;
}

/* Calendar grid */
.calendar-grid {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 48px;
}

.calendar-day .day-number {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.calendar-day:not(.empty):hover {
  transform: translateY(-2px);
  z-index: 10;
  filter: brightness(1.15);
}

.calendar-day.empty {
  cursor: default;
  opacity: 0.3;
  background: transparent !important;
}

.calendar-day.level-0 {
  background: rgba(125, 125, 125, 0.1);
}

.calendar-day.level-1 {
  background: rgba(64, 196, 99, 0.3);
}

.calendar-day.level-2 {
  background: rgba(64, 196, 99, 0.5);
}

.calendar-day.level-3 {
  background: rgba(64, 196, 99, 0.7);
}

.calendar-day.level-4 {
  background: rgba(64, 196, 99, 1);
}

.heatmap-legend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 1rem;
  justify-content: flex-end;
}

.legend-label {
  font-size: 0.75rem;
  opacity: 0.6;
  margin: 0 0.25rem;
}

.legend-item {
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

/* Dark mode */
.dark .heatmap-container {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark .calendar-day.level-0 {
  background: rgba(255, 255, 255, 0.05);
}

.dark .calendar-day:not(.empty):hover {
  filter: brightness(1.25);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .heatmap-container {
    padding: 1rem;
  }

  .calendar-day {
    min-height: 36px;
  }

  .calendar-day .day-number {
    font-size: 0.75rem;
  }

  .weekday-header {
    font-size: 0.7rem;
  }

  .heatmap-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .date-range {
    font-size: 0.8rem;
  }

  .legend-item {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 480px) {
  .calendar-day {
    min-height: 28px;
  }

  .calendar-day .day-number {
    font-size: 0.7rem;
  }

  .weekday-header {
    font-size: 0.65rem;
  }
}
</style>
