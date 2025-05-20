<script setup lang="ts">
import { formatDate } from '~/logics'
import { supabase } from '~/logics/supabase'

type MediaType = 'book' | 'movie' | 'drama' | 'post' | 'tool'
type MediaState = 'done' | 'doing' | 'todo'

interface MediaRecord {
  name: string
  created_at: string
  type: MediaType
  creator?: string
  state?: MediaState
  lang?: string
  url?: string
}

const route = useRoute()
const type = computed<MediaType>(() => route.query.type as MediaType || 'post')
const media = ref([] as MediaRecord[])
onMounted(async () => {
  const data = await supabase.from('bookmark')
    .select('*')
    .eq('enabled', true)
    .order('created_at', { ascending: false })
  if (data.status === 200) {
    media.value = data.data as unknown as MediaRecord[]
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
          <template v-for="m in media.filter((m) => m.type === t)" :key="m.name">
            <tr v-if="!m.state">
              <td><a :href="m.url">{{ m.name }}</a></td>
              <td text-right>
                {{ m.creator }}
              </td>
              <td v-if="false" lt-sm:hidden>
                {{ formatDate(m.created_at) }}
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </template>
  </div>
</template>
