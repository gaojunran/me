<script setup lang="ts">
import { formatDate } from '~/logics'

type MediaType = 'book' | 'movie' | 'drama' | 'post' | 'tool'

interface MediaRecord {
  id: number
  title: string
  type: MediaType
  subtitle?: string
  url?: string
  disabled?: boolean
}

const route = useRoute()
const type = computed<MediaType>(() => route.query.type as MediaType || 'post')
const media = ref([] as MediaRecord[])

onMounted(async () => {
  try {
    const response = await fetch('https://api.codenebula.top/blog/bookmarks/list')
    if (response.ok) {
      const data = await response.json()
      media.value = data as MediaRecord[]
    }
  }
  catch (error) {
    console.error('Failed to fetch bookmarks:', error)
  }
})
</script>

<template>
  <div font-mono>
    <div flex="~ gap-4">
      <RouterLink
        v-for="t of ['post', 'tool', 'book', 'movie', 'drama']"
        :key="t"
        :to="{ query: { type: t } }"
        px-2
        class="border-none!"
        :class="type === t ? 'bg-black dark:bg-white text-white! dark:text-black!' : ''"
      >
        {{ t }}
      </RouterLink>
    </div>

    <template v-for="t of ['post', 'tool', 'book', 'movie', 'drama']" :key="t">
      <table v-show="type === t" font-400>
        <tbody>
          <template v-for="m in media.filter((m) => m.type === t)" :key="m.id">
            <tr>
              <td><a :href="m.url">{{ m.title }}</a></td>
              <td text-right>
                {{ m.subtitle }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>
