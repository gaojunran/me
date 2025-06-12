<template>
  <div class="flex justify-center my-2">
    <button @click="toggleLamp" class="bg-white text-gray-900 border border-gray-300 hover:bg-gray-100 hover:shadow-md rounded-2xl px-4 py-2 text-sm font-medium transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300">
    {{ mapping[state].toUpperCase() }}
    </button>
  </div>
</template>

<script setup>
const mapping = ["点我控制台灯", "off", "on", "error"]
const state = ref(0)

const toggleLamp = () => {
  fetch('http://123.249.70.0/api/blog/test-mihome')
  .then(res => res.json())
  .then(res => {
    const rawState = JSON.parse(res.data)?.[0]?.state
    if (rawState === 'off') {
      state.value = 2
    } else if (rawState === 'on') {
      state.value = 1
    } else {
      state.value = 0
    }
  })
  .catch(() => {
    state.value = 3
  })
}
</script>
