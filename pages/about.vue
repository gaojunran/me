<script setup lang="ts">
import {Icon} from "@iconify/vue";
import {toWhere} from "~/utils/linkTo";

const today = new Date();
const age = ref(today.getFullYear() - 2005 - ((today.getMonth() > 3 || (today.getMonth() == 3 && today.getDate() >= 3)) ? 0 : 1));
const focusOn = ref(['前端开发', 'Rust']);

const platforms = ref([
  { name: 'GitHub', label: 'gaojunran', icon: 'mdi:github', link: 'https://github.com/gaojunran' },
  { name: 'Bilibili', label: '永远预备役', icon: 'tabler:brand-bilibili', link: 'https://space.bilibili.com/456066643' },
  { name: 'QQ', label: '489601672', icon: 'tabler:brand-qq', link: '' },
  { name: 'Email', label: 'nebula2021@126.com', icon: 'tabler:mail', link:'mailto:nebula2021@126.com' }
])
</script>

<template>
  <div>
    <h1 class="text-5xl font-bold mt-4 mb-12 long-cang-regular">高浚然</h1>
    <p class="mb-4">
      {{ age }} 岁。重庆邮电大学软件工程专业本科就读。
    </p>
    <div class="mb-3">
      <span class="-mr-2">
        软件开发者，开源爱好者。现在正专注于学习和应用：
      </span>
      <Tag v-for="tag in focusOn" :key="tag" class="mx-1" severity="info">{{ tag }}</Tag>
    </div>
    <div>
      <span class="-mr-2">
        你可以关注或联系我：
      </span>
      <Button v-for="platform in platforms" :key="platform.name" class="mx-1" size="small"
              @click="platform.link ? toWhere(platform.link) : null"
              :label="platform.label" :pt="{ root: '!bg-black/10 !text-white !border-white/0 hover:!bg-black/20' }">
        <template #icon>
          <Icon :icon="platform.icon" />
        </template>
      </Button>

    </div>
  </div>

</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Long+Cang&display=swap');

.long-cang-regular {
  font-family: "Long Cang", serif;
  font-weight: 400;
  font-style: normal;
}

</style>