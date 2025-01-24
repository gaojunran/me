<script setup lang="ts">

import ProjectCard from "~/components/ProjectCard.vue";
import type {Project} from "~/types/Project";
import {toGithub} from "~/utils/linkTo";

const projects = ref([] as Project[]);

onMounted(async () => {
  projects.value = await queryCollection("projects").order("name", "ASC").all()
});


</script>

<template>
  <div>
    <div class="flex justify-start items-center gap-4 mt-4 mb-12">
      <h1 class="text-3xl font-bold">我的项目</h1>
      <Button @click="toGithub()" icon="pi pi-github"
        :pt="{ root: '!bg-white/0 !text-white !border-white/0 hover:!bg-black/20'}"
      ></Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-12">
      <ProjectCard v-for="project in projects" :key="project.name" :project="project"></ProjectCard>
    </div>
  </div>

</template>

<style scoped>

</style>