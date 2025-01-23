<script setup lang="ts">
import type {Project} from "~/types/Project";
import { Tag } from "primevue";
import {toGithub} from "~/utils/linkTo";
import {getLanguageColor} from "~/utils/languageMapping";
const props = defineProps<{
  project: Project
}>()

const hover = ref(false)


</script>

<template>
  <div class="bg-black/30 rounded-lg w-68 cursor-pointer hover:bg-black/40 transition group" id="card"
      @mouseover="hover = true" @mouseout="hover = false"
       @click="toGithub(props.project.name)">
    <div class="flex flex-col justify-between items-center p-4 h-full">
      <h3 class="text-xl font-bold mb-2">{{ props.project.name }}</h3>
      <p class="text-white/50 text-sm group-hover:text-white transition duration-500">{{ props.project.description }}</p>
      <div class="flex items-center mt-2 gap-2">
        <Tag v-for="tag in props.project.languages" id="tag"
             class="mt-1 transition duration-500"
             :style="hover ? {
               backgroundColor: getLanguageColor(tag) + '60',
               color: getLanguageColor(tag)
             } : {
               backgroundColor: getLanguageColor(tag) + '10',
               color: '#ffffff60'
             }"
             :key="tag" severity="info">{{ tag }}</Tag>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>