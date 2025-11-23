<script setup lang="ts">
interface StatItem {
  name: string
  value: string
  percent: number
  color?: string
}

defineProps<{
  title: string
  icon: string
  items: StatItem[]
  maxItems?: number
}>()

// Color palette for different items
const colorPalette = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
]

function getItemColor(index: number): string {
  return colorPalette[index % colorPalette.length]
}
</script>

<template>
  <div class="stat-card">
    <h3 class="stat-title">
      <div :class="icon" class="title-icon" />
      {{ title }}
    </h3>
    <div class="stat-items">
      <div 
        v-for="(item, index) in items.slice(0, maxItems || 8)" 
        :key="index" 
        class="stat-item"
        :style="{ '--item-delay': `${index * 0.1}s` }"
      >
        <div class="item-info">
          <div class="item-header">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-percent">{{ item.percent.toFixed(1) }}%</span>
          </div>
          <div class="item-meta">
            <span class="item-value">{{ item.value }}</span>
          </div>
        </div>
        <div class="progress-container">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: `${item.percent}%`,
                background: item.color || getItemColor(index),
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  padding: 1.5rem;
  background: rgba(125, 125, 125, 0.03);
  border: 1px solid rgba(125, 125, 125, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.stat-card:hover {
  background: rgba(125, 125, 125, 0.06);
  border-color: rgba(125, 125, 125, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.stat-title {
  display: flex;
  align-items: center;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 0;
  margin-bottom: 0.875rem;
  letter-spacing: -0.02em;
}

.title-icon {
  margin-right: 0.75rem;
  font-size: 1.5rem;
  opacity: 0.8;
}

.stat-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideIn 0.5s ease-out backwards;
  animation-delay: var(--item-delay);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-name {
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.item-percent {
  font-size: 0.9rem;
  font-weight: 700;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.item-value {
  font-size: 0.85rem;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
}

.progress-container {
  width: 100%;
}

.progress-bar {
  height: 8px;
  background: rgba(125, 125, 125, 0.08);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Dark mode */
.dark .stat-card {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.dark .stat-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.dark .progress-bar {
  background: rgba(255, 255, 255, 0.08);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 1.25rem;
  }

  .stat-title {
    font-size: 1.125rem;
  }

  .title-icon {
    font-size: 1.25rem;
  }

  .stat-items {
    gap: 1rem;
  }

  .item-name {
    font-size: 0.9rem;
  }

  .item-percent {
    font-size: 0.85rem;
  }

  .item-value {
    font-size: 0.8rem;
  }

  .progress-bar {
    height: 6px;
  }
}
</style>
