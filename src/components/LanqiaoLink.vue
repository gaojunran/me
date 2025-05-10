<script setup lang="ts">
const props = defineProps<{
  name: string
  id: string
}>()
</script>

<template>
  <MagicLink
    image="https://static.shiyanlou.com/lanqiao/frontend/static/favicon.ico"
    :text="props.name"
    :url="`https://www.lanqiao.cn/problems/${props.id}/learning`"
  />
</template>
