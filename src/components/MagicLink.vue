<script setup lang="ts">
const props = defineProps<{
  image?: string
  text: string
  url: string
}>()
</script>

<template>
  <a :href="props.url" class="markdown-magic-link markdown-magic-link-link" target="_blank" rel="noopener">
    <span
      v-if="props.image" class="markdown-magic-link-image"
      :style="`background-image: url(&quot;${props.image}&quot;);`"
    />
    {{ props.text }}
  </a>
</template>
