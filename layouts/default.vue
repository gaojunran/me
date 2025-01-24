<script setup lang="ts">

import Button from 'primevue/button';
import {breakpointsTailwind, useBreakpoints} from "@vueuse/core";



const router = useRouter();

const breakpoints = useBreakpoints(
    breakpointsTailwind,
    { ssrWidth: 768 } // Will enable SSR mode and render like if the screen was 768px wide
)

const activeBreakpoint = breakpoints.active()
const isMobile = computed(() => activeBreakpoint.value === '')

const nav = ref(new Set([
  {label: '喜欢', to: '/favourites', icon: 'pi pi-heart'},
  {label: '项目', to: '/projects', icon: 'pi pi-briefcase'},
  {label: '博客', to: '/blog', icon: 'pi pi-link'},
]));

const mobileNavItem = {label: '关于我', to: '/about', icon: 'pi pi-user'};

watch(isMobile, (newVal, _) => {
  if (newVal) {  // mobile
    nav.value.delete(mobileNavItem)
  } else {
    nav.value.add(mobileNavItem)
  }
}, { immediate: true })

</script>

<template>
  <div id="bg" class="min-h-screen w-full px-8">
    <header>
      <nav class="flex justify-between items-center mb-8">
        <img src="/avatar.jpg" class="my-4 mx-2 sm:mx-4 w-12 h-12 cursor-pointer
              rounded-full hover:scale-110 transition ease-in-out duration-300" alt="Avatar"
               @click="router.push('/about')"
        />
        <div class="flex justify-end items-center">
          <Button :pt="{ root: '!bg-white/0 hover:!bg-white/20 !text-white/70 ' +
       'hover:!text-white !border-white/0 hover:!scale-110 !transition !ease-in-out !duration-300' }"
                  v-for="navItem in nav" :label="navItem.label" @click="router.push(navItem.to)"
                  class="my-4 mx-2 sm:mx-4" :size="isMobile ? 'small' : undefined" :icon="isMobile ? '' : navItem.icon"
          ></Button>
        </div>
      </nav>

      <main class="px-4">
        <slot/>
      </main>

    </header>
  </div>


</template>

<style>
#bg {
  background: url("/noise-light.png") rgb(54, 86, 107);
}
</style>
