<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Task {
  name: string
  project: string
  isDone: boolean
}

const tasks = ref<Task[]>([])
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const response = await fetch('/api/blog/tasks/today')
    if (!response.ok) throw new Error('Failed to fetch tasks')
    tasks.value = await response.json()
  } catch (e) {
    console.error('Failed to load tasks:', e)
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div>
      <span font-bold>今日任务</span>
      <span op75 text-sm>(<RouterLink to="/tasks" hover:op100 transition>查看全部任务</RouterLink>)</span>
    </div>

    <div v-if="loading" op50 mt-2>
      加载中...
    </div>
    <div v-else-if="error" op50 mt-2>
      加载失败
    </div>
    <div v-else-if="tasks.length === 0" op50 mt-2>
      暂无任务
    </div>
    <ul v-else mt-2>
      <li v-for="task in tasks" :key="task.name">
        <span :class="task.isDone ? 'op50 line-through' : ''">{{ task.name }}</span>
        <span op50 text-sm> ({{ task.project }})</span>
      </li>
    </ul>
  </div>
</template>
