<script setup lang="ts">
import type {Project} from "~/types/Project";
import { Tag } from "primevue";
const props = defineProps<{
  project: Project
}>()

const toGithub = (projectName: string) => {
  window.open(`https://github.com/gaojunran/${projectName}`, '_blank')
}

</script>

<template>
  <div class="bg-black/30 rounded-lg w-68 cursor-pointer hover:bg-black/40 transition"
       @click="toGithub(props.project.name)">
    <div class="flex flex-col justify-between items-center p-4 h-full">
      <h3 class="text-xl font-bold mb-2">{{ props.project.name }}</h3>
      <p class="text-white/50 text-sm">{{ props.project.description }}</p>
      <div class="flex items-center mt-2 gap-2">
        <Tag v-for="tag in props.project.languages"
             :key="tag" class="mt-2" severity="info">{{ tag }}</Tag>
      </div>

    </div>
  </div>
</template>

<style scoped>

</style>