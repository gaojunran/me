<script setup lang="ts">

const slug = useRoute().params.slug;

const { data: page } = await useAsyncData(`blog-${slug}`, () => {
  return queryCollection("blog").path(`/blog/${slug}`).first()
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>

<style scoped>

</style>