---
title: Vue 中的 Computed Model
date: 2025-05-12T00:00:00Z
lang: zh
duration: 10min
---

写这篇博文的起因是我最近在刷蓝桥杯国赛的题，有这样一道题目：

[题解](/posts/lanqiao-2023-2#%E8%A1%A8%E5%8D%95%E7%94%9F%E6%88%90%E5%99%A8%EF%BC%88%E5%A4%A7%E5%AD%A6%E7%BB%84%EF%BC%89)

[题目](https://www.lanqiao.cn/problems/18477/learning/)

这道题的其中一部分需要 **在父子组件间双向绑定一个属性**，但这个属性不像通常的 `v-model` 那样在父子组件中值保持完全一样，而是**保持一个计算关系**（类似于`computed`）。也就是说：

- 父组件绑定的值变化后，子组件的值会随之根据计算关系变化；
- 子组件的值变化后，触发回调事件，父组件的值也会随之根据计算关系变化。

> 在继续阅读之前，我推荐你读一下 Vue3 的官方文档：
>
> - [表单输入绑定](https://vuejs.org/guide/essentials/forms.html)
> - [`defineModel`](https://vuejs.org/guide/components/v-model.html)
> - [计算属性](https://vuejs.org/guide/essentials/computed.html)
> - [侦听器](https://vuejs.org/guide/essentials/watchers.html)

---

## 父组件

父组件 `App.vue`：

```vue
<script setup>
import { ref } from 'vue'
const number = ref(1)
</script>

<template>
  <div>父组件</div>
  <input v-model="number" style="margin-bottom: 10px">
  <div>子组件 使用`computed`</div>
  <CompComputed v-model="number" />
  <div>子组件 使用`watch`</div>
  <CompWatch v-model="number" />
  <div>子组件 使用`defineModel`</div>
  <CompModel v-model="number" />
</template>
```

在父组件中，我们定义了`number`响应式变量，并使用`v-model`绑定到各个子组件上。稍后我们就要实现三种不同的子组件。

---

## 子组件实现一：`computed`

Vue 3 中 `v-model` 默认会被编译为`modelValue`（props）和`update:modelValue`（emit），因此我们可以使用`defineProps`和`defineEmits`来声明我们组件中被传入的属性和事件。

接着我们需要定义一个**可读可写**的计算属性`model`。在获取`model`的值时，应当返回`modelValue`的值乘以2；在`model`的值改变时，应当将新值除以2，并触发`update:modelValue`事件将这个值交给父组件。

通常`computed`是**只读**的，但我们可以像如下写法一样，给`computed`传入`get`和`set`两个方法，使之变成可写的计算属性：

```vue
<script setup>
import { computed } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => {
    return props.modelValue * 2
  },
  set: (val) => {
    const newVal = val / 2
    emit('update:modelValue', newVal)
    return newVal
  }
})
</script>

<template>
  <input v-model="model">
</template>
```

## 子组件实现二：`watch`

事实上`computed`应该是一个纯函数的计算操作，而我们在其`set`方法中产生了副作用（即触发了`emit`事件），这违反了`computed`的纯函数特性。因此，我们可以使用`watch`来代替`computed`，实现同样的效果：

```vue
<script setup>
import { ref, watch } from 'vue'

const props = defineProps(['modelValue'])
const emit = defineEmits(['update:modelValue'])
const model = ref(props.modelValue * 2)

watch(() => props.modelValue, (newValue) => {
  model.value = newValue * 2
})

watch(model, (newValue) => {
  emit('update:modelValue', newValue / 2)
})
</script>

<template>
  <input v-model="model">
</template>
```

这更加好理解，监听`props.modelValue`的变化，将新值乘以2赋值给`model`；监听`model`的变化，将新值除以2赋值给`props.modelValue`。

不必担心，这样写不会导致死循环，因为`watch`的回调仅在值真正改变时才会触发。

## 子组件实现三：`defineModel`

手写`emit('update:modelValue', newValue)`怎么看都不像是最优雅的写法，实际上 Vue3.4+ 提供了一个便利的宏`defineModel`，可以更方便地实现双向绑定：

```js
const model = defineModel()
```

这会创建一个响应式变量`model`，它接受来自父组件`v-model`的值并随之动态变化。同时在子组件内监听其变化，当`model`的值改变时，会自动触发`emit('update:modelValue', newValue)`。

但是这么写只能保证父子组件中双向绑定的值同步（即一模一样），如果要实现计算属性呢？

Vue3 的 [官方文档](https://vuejs.org/api/sfc-script-setup.html#modifiers-and-transformers) 中提到，`defineModel`可以携带一些`options`，其中就包括`transformers`，可以在**读取或同步回父级时转换该值**，这正是我们需要的🎉！

可以这样写：

```vue
<script setup>
const model = defineModel({
  get: value => value * 2,
  set: value => value / 2
})
</script>

<template>
  <input v-model="model">
</template>
```

你会发现代码变得相当简洁！Vue 给我们提供了太多便利的写法，满满的 DX！

不过这样写貌似还不太流行，我在 GitHub 上搜了很久才看到有人这样写，希望 Vue 3 的文档能把这种写法的用途强调一下！

你可以在 [Vue SFC Playground](https://play.vuejs.org/#eNq9VUGL00AU/ivDXJqV2uDqqdsWVPagoC4qenCE7SbT3ewmkzAz6XYphR48eBDcBUEQFTzpxYKXvRTxvyxb68/wzUySJmlawcMeSpP3vnnve997bzLEt6Oo0Y8pbuKWcLgXSSSojKMOYV4QhVyiIeK0h0aox8MA1QBay1x3wyB6ELrUT5wNO7OomLWtAlL9YkndAjg1VuCfd6VzUABrS4p0QiYkYnGwRzlqK5LWjQ3CWrYpAwqAF0mDyO9KCm8ItVyv35m/Pp99P51PX11Ozy/GH/9Mvswn72c/Pv8ef70Yf5q9fTM7PZtPz2aTDy1b4fVBjwFJ1L8eqNLaBJusBCMhT3wKBtcTkOekifb80DnaIrjTsvWhReLLn7/m777turTnMao12s1lWEi5nAViZe6leE4iYDlYpvbKeCliKeSxkrkcz3RjZTDtNprbOdFxHUsBnep5+41DETIYs6EKSbDi7fmUP4qkB50kuIm0R/m6vh8e39c2yWNaT+3OAXWOKuyHYqBsBO9wKijvU4Izn+zyfSqNe/vJQzqA58wJxcQ+oNc4H1MR+rHiaGB3YuYC7RxOs72n59Zj+0/F9kBSJtKiFFGFHGk8wTC9Sq9VpS/o3mzc0ucIG4GKhcWqWFazDbo5sAy5IbN0aIjZRFa/68d0A7U7SD+ha2hTs4IgFV4bbULu4kqVFqq8F/q/MPzlaSjv/Lp7Jx3twuUDm59WG/EwElm1O+rNelHTHJ6pCmovgbyB0sCTGXIbXhQyjlzg1aw8kCqZcsjLqDVKOsaBNGeGSmMRSUm76Hqmb/5kcn/RYzgAicCrFIfylFPxtQheYghjlxwBprn8xqYPq4FZdw/+Z9Oyu3ddx/TNUV/6YFxxz9SnoKohACRMU7RMD8ugOrKMkMke6E5pd8OsRDsROm2wEjoNqXGVEf7dTLNtEGxt51YvHLKXujb6C3Xqx9A=) 中获取全部代码。
