<script setup lang="ts">
const { data } = await useAsyncData(`blog-fetch`, () => {
  return queryCollection("blog").all();
})
</script>

<template>
  <div>
    {{ data }}
  </div>
</template>

<style scoped>

</style>