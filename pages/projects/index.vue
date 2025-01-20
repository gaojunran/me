<script setup lang="ts">

import ProjectCard from "~/components/ProjectCard.vue";
import type {Project} from "~/types/Project";

const projects = [{
  name: "auto-notes",
  chineseName: "帮你记",
  description: "基于大模型的智能课堂笔记系统。",
  languages: ["Python", "Vue", "Rust"]
}, {
  name: "remote-send-tauri",
  description: "基于S3存储的跨端远程文件传输助手。",
  languages: ["Vue", "Rust"]
},
  {
    name: "CQUPT-Art",
    description: "重庆邮电大学教务在线美化插件。",
    languages: ["Vue"]
  },
  {
    name: "obs-vitesse",
    description: "基于Vite/Vue3的OBS直播包装模板。",
    languages: ["Vue"]
  },{
    name: "wordy",
    description: "在命令行中查单词、记单词、生成可高度自定义的单词表。",
    languages: ["Python", "Typst"]
  }] as Project[];
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mt-4 mb-12">我的项目</h1>
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      <ProjectCard v-for="project in projects" :key="project.name" :project="project"></ProjectCard>
    </div>
  </div>

</template>

<style scoped>

</style>