<script setup lang="ts">

import Button from 'primevue/button';

const nav = ref([
  {label: '喜欢', to: '/favourites', icon: 'pi pi-heart'},
  {label: '项目', to: '/projects', icon: 'pi pi-briefcase'},
  {label: '博客', to: '/blog', icon: 'pi pi-link'},
  {label: '关于我', to: '/about', icon: 'pi pi-user'}
])

const router = useRouter();
</script>

<template>

  <div id="bg" class="h-screen w-full px-8">
    <header>
      <nav class="flex justify-between items-center mb-8">
        <img src="/avatar.jpg" class="ml-4 mt-4 w-12 h-12 cursor-pointer
              rounded-full hover:scale-110 transition ease-in-out duration-300" alt="Avatar"
               @click="router.push('/about')"
        />
        <div class="flex justify-end items-center">
          <Button :pt="{ root: '!bg-white/0 hover:!bg-white/20 !text-white/70 ' +
       'hover:!text-white !border-white/0 hover:!scale-110 !transition !ease-in-out !duration-300' }"
                  v-for="navItem in nav" :label="navItem.label" @click="router.push(navItem.to)" :icon="navItem.icon"
                  class="m-4"
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
