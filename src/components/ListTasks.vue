<script setup lang="ts">
interface Task {
  name: string;
  dueDate: string | null;
  isDone: boolean;
}

type TasksByProject = Record<string, Task[]>;

const tasks = ref<TasksByProject>({});
const loading = ref(true);
const error = ref(false);
const showCompleted = ref<Record<string, boolean>>({});

onMounted(async () => {
  try {
    const response = await fetch("/api/blog/tasks/projects");
    if (!response.ok) throw new Error("Failed to fetch tasks");
    tasks.value = await response.json();

    // Initialize showCompleted state for each project
    Object.keys(tasks.value).forEach((project) => {
      showCompleted.value[project] = false;
    });
  } catch (e) {
    console.error("Failed to load tasks:", e);
    error.value = true;
  } finally {
    loading.value = false;
  }
});

function formatDate(date: string | null) {
  if (!date) return null;

  // Parse the date and convert to Beijing timezone
  const targetDate = new Date(date);
  const now = new Date();

  // Convert both dates to Beijing timezone (UTC+8) and get date only
  const beijingOffset = 8 * 60 * 60 * 1000;
  const targetBeijingDate = new Date(targetDate.getTime() + beijingOffset);
  const nowBeijingDate = new Date(now.getTime() + beijingOffset);

  // Get date components in UTC (which now represents Beijing time)
  const targetDay = new Date(
    Date.UTC(
      targetBeijingDate.getUTCFullYear(),
      targetBeijingDate.getUTCMonth(),
      targetBeijingDate.getUTCDate(),
    ),
  );
  const todayDay = new Date(
    Date.UTC(
      nowBeijingDate.getUTCFullYear(),
      nowBeijingDate.getUTCMonth(),
      nowBeijingDate.getUTCDate(),
    ),
  );

  const diff = targetDay.getTime() - todayDay.getTime();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days < 0) {
    // Format as YYYY-MM-DD for overdue tasks
    const year = targetBeijingDate.getUTCFullYear();
    const month = String(targetBeijingDate.getUTCMonth() + 1).padStart(2, "0");
    const day = String(targetBeijingDate.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  if (days === 0) return "今天";
  if (days === 1) return "明天";
  if (days <= 7) return `${days} 天后`;

  return targetDate.toLocaleDateString("zh-CN", {
    month: "numeric",
    day: "numeric",
  });
}

function isOverdue(date: string | null) {
  if (!date) return false;

  const targetDate = new Date(date);
  const now = new Date();

  // Convert to Beijing timezone and compare dates only
  const beijingOffset = 8 * 60 * 60 * 1000;
  const targetBeijingDate = new Date(targetDate.getTime() + beijingOffset);
  const nowBeijingDate = new Date(now.getTime() + beijingOffset);

  const targetDay = new Date(
    Date.UTC(
      targetBeijingDate.getUTCFullYear(),
      targetBeijingDate.getUTCMonth(),
      targetBeijingDate.getUTCDate(),
    ),
  );
  const todayDay = new Date(
    Date.UTC(
      nowBeijingDate.getUTCFullYear(),
      nowBeijingDate.getUTCMonth(),
      nowBeijingDate.getUTCDate(),
    ),
  );

  return targetDay < todayDay;
}

function getActiveTasks(projectTasks: Task[]) {
  return projectTasks.filter((task) => !task.isDone);
}

function getCompletedTasks(projectTasks: Task[]) {
  return projectTasks.filter((task) => task.isDone);
}

function toggleCompleted(project: string) {
  showCompleted.value[project] = !showCompleted.value[project];
}
</script>

<template>
  <div class="max-w-300">
    <div v-if="loading" text-center py10 op50>加载中...</div>

    <div v-else-if="error" text-center py10 op50>加载失败，请稍后重试</div>

    <div v-else>
      <div
        v-for="(project, cidx) in Object.keys(tasks)"
        :key="project"
        slide-enter
        :style="{ '--enter-stage': cidx + 1 }"
      >
        <div
          select-none
          relative
          h18
          mt5
          pointer-events-none
          slide-enter
          :style="{
            '--enter-stage': cidx - 2,
            '--enter-step': '60ms',
          }"
        >
          <span
            text-5em
            color-transparent
            absolute
            left--1rem
            top-0rem
            font-bold
            leading-1em
            text-stroke-1.5
            text-stroke-hex-aaa
            op35
            dark:op20
          >
            {{ project }}
          </span>
        </div>

        <div class="py-2 mt-4">
          <!-- Active Tasks -->
          <div v-if="getActiveTasks(tasks[project]).length > 0" class="mb-4">
            <div
              v-for="(task, idx) in getActiveTasks(tasks[project])"
              :key="idx"
              class="task-item flex items-start py-2 px-3 mb-2 rounded hover:bg-gray-500:10 transition-colors"
            >
              <div class="flex-none mr-3 mt-1">
                <div
                  class="w-4 h-4 rounded-full border-2 border-current op50"
                />
              </div>
              <div class="flex-auto">
                <div class="text-base leading-relaxed">
                  {{ task.name }}
                </div>
                <div
                  v-if="formatDate(task.dueDate)"
                  class="text-sm mt-1"
                  :class="
                    isOverdue(task.dueDate) ? 'text-red-500 op75' : 'op50'
                  "
                >
                  {{ formatDate(task.dueDate) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Completed Tasks -->
          <div v-if="getCompletedTasks(tasks[project]).length > 0" class="mb-4">
            <button
              class="text-sm op50 hover:op75 transition-opacity mb-2 flex items-center gap-1"
              @click="toggleCompleted(project)"
            >
              <div
                class="i-carbon-chevron-right transition-transform"
                :class="{ 'rotate-90': showCompleted[project] }"
              />
              已完成 ({{ getCompletedTasks(tasks[project]).length }})
            </button>

            <div v-show="showCompleted[project]">
              <div
                v-for="(task, idx) in getCompletedTasks(tasks[project])"
                :key="idx"
                class="task-item flex items-start py-2 px-3 mb-2 rounded op50 line-through"
              >
                <div class="flex-none mr-3 mt-1">
                  <div class="w-4 h-4 rounded-full bg-current op30" />
                </div>
                <div class="flex-auto">
                  <div class="text-base leading-relaxed">
                    {{ task.name }}
                  </div>
                  <div v-if="task.dueDate" class="text-sm mt-1 op75">
                    {{ formatDate(task.dueDate) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="
              getActiveTasks(tasks[project]).length === 0 &&
              getCompletedTasks(tasks[project]).length === 0
            "
            class="text-center py-4 op50"
          >
            暂无任务
          </div>
        </div>
      </div>
    </div>

    <div class="prose pb5 mx-auto mt10 text-center">
      <hr />
    </div>
  </div>
</template>

<style scoped>
.task-item {
  cursor: default;
}
</style>
