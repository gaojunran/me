<script setup>
const state = ref('Click me!')

function toggleLamp() {
  fetch('http://123.249.70.0/api/blog/test-mihome')
    .then(res => res.json())
    .then((res) => {
      const rawState = JSON.parse(res.data)?.[0]?.state
      if (rawState === 'off') {
        state.value = 'OFF'
      }
      else if (rawState === 'on') {
        state.value = 'ON'
      }
    })
    .catch(() => {
      state.value = 'Error'
    })
}
</script>

<template>
  <div class="flex justify-center my-2">
    <button :disabled="new Date().getHours() >= 0 && new Date().getHours() <= 8" class="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 hover:shadow-md rounded-lg px-4 py-2 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300" @click="toggleLamp">
      {{ state }}
    </button>
  </div>
</template>
