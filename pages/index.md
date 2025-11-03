---
title: CodeNebula
description: CodeNebula's Portfolio
art: dots
---

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

👏🏻 你好！我叫 **高浚然**，是一名 **Web 开发者**。

在读 {重庆邮电大学} 的软件工程专业；

熟悉 {Vue} {React} {TypeScript} {Rust} {Kotlin}；

💼 现在在 [腾讯 WXG 小程序部门](https://www.tencent.com/zh-cn/about.html#about-con-4) 实习。

---

**今日任务** <span op75 text-sm>(<RouterLink to="/tasks" hover:op100 transition>查看全部任务</RouterLink>)</span>

<div v-if="loading" op50 mt-2>加载中...</div>
<div v-else-if="error" op50 mt-2>加载失败</div>
<div v-else-if="tasks.length === 0" op50 mt-2>暂无任务</div>
<ul v-else mt-2>
  <li v-for="task in tasks" :key="task.name">
    <span :class="task.isDone ? 'op50 line-through' : ''">{{ task.name }}</span>
    <span op50 text-sm> ({{ task.project }})</span>
  </li>
</ul>

---

我很热爱开源社区，欣赏社区小伙伴们的优质作品，你可以在 [这里](/bookmarks) 看到我收藏的「好东西」。我自己也开发和维护开源项目，展示在 [这里](/projects)。

<div flex-auto />

---

我的社交平台：
<a href="https://github.com/gaojunran" target="_blank"><span op75 i-simple-icons-github /> GitHub</a>
<a ml-4 href="https://space.bilibili.com/3493089530350281" target="_blank"><span op75 i-simple-icons-bilibili /> 哔哩哔哩</a>
<a ml-4 href="https://afdian.tv/a/CodeNebula" target="_blank"> <span op75 mr-1 i-simple-icons-afdian />爱发电</a>

发邮件给我： <span font-mono>nebula2021<span i-carbon-at/>126.com</span>

欢迎加入我的QQ群：<span font-mono>1037341972</span>，一起交流和进步！
