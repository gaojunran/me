---
title: 蓝桥杯 2024 年国赛题解（一）
date: 2025-05-23T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 真人鉴定器

题目：<LanqiaoLink name="真人鉴定器" id="18582" />

签到题。

```js
isPre ? thisIndex-- : thisIndex++
if (thisIndex === -1)
  thisIndex = 3
if (thisIndex === 4)
  thisIndex = 0
```

## 俄罗斯方块

题目：<LanqiaoLink name="俄罗斯方块" id="18583" />

一道考察 `grid` 的题目。

```css
.z-shape {
  display: grid;
  /* TODO：待补充代码 */
  grid-template-columns: repeat(4, 30px);
  grid-template-rows: repeat(2, 30px);
}

.l-shape {
  display: grid;
  /* TODO：待补充代码 */
  grid-template-columns: repeat(3, 30px);
  grid-template-rows: repeat(2, 30px);
}
```

值得注意的是，这题的 HTML 结构如下：

```html
<div class="grid-container">
  <div class="z-shape">
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell"></div>
    <div class="cell"></div>
  </div>
</div>
```

题目已经给出 `grid-container` 的 `grid` 排列。我们可以有两种思路：

- 思路一：定义 `z-shape` 如何排列在 `grid-container` 中：`grid-area: span 2 / span 4;` 或 `grid-area: 1 / 1 / 3 / 5;`。也可以用 `grid-row` 和 `grid-column` 分开定义：`grid-row: 1 / 3; grid-column: 1 / 5;`。

- 思路二：定义 `z-shape` 内部的 `grid` 排列：`grid-template-columns: repeat(4, 30px); grid-template-rows: repeat(2, 30px);`。题解区也给出了`grid-template-columns: inherit; grid-template-rows: inherit;` 这种做法，因为和父元素定义的 `grid` 排列是一致的。

但是注意，下面这种语法**没有定义子元素的排列，只是给子元素的排列进行了命名**，这么写在本题中是无效的：

```css
.z-shape {
  grid-template-areas:
    'c1 c2 c3 c4'
    'c5 c6 c7 c8';
}
```

第一种思路是最直观的，而第二种思路借助 `z-shape` 内部的 `cell`，将 `z-shape` 撑开，实现一样的效果。

时刻注意，带 `template` 的是**父元素定义子元素如何排列**；不带 `template` 的是**子元素定义自己如何排列在父元素中**。

如果你对 `grid` 不太熟悉，可以去 MDN 官网或者 Tailwind CSS 官网学习一下。没有意外的话这应该是国赛的必考题。

## 个人消息同步

题目：<LanqiaoLink name="个人消息同步" id="18584" />

第一问是很简单的获取数据：

```js
const MockUrl = './data.json'
async function getUserMessage() {
  // TODO：待补充代码
  const data = await (await fetch(MockUrl)).json()
  messageState.value = data.data
  // TODO：END
}
```

将异步请求的操作封装到 Pinia 是一个比较好的实践。在上面的代码中我们在一行中使用了两次 `await`，完成异步请求获取数据。要注意关注**获取到的数据是否直接可用**，在本题中还需要获取其 `data` 字段。

第二问只需要把 store 在 `setup` 函数中导入即可：

```vue
<script setup>
// ...
const store = useMessageStore()
</script>

<template>
  <div class="tip">
    {{ store.messageState.length }}
  </div>
</template>
```

原题中的写法不是`<script setup>`，不要忘记 `return` `store` 这个变量，以在模板中使用。注意 `store` 里导出的响应式变量不需要调用 `value` 直接就可以使用。

前两问如果你熟悉 Pinia 几分钟就可以做对，如果不熟悉可以去 [官方文档](https://pinia.vuejs.org/introduction.html) 学习一下。

第三问用简单的 `v-for` 即可，在此不再赘述。

## 工作协调

题目：<LanqiaoLink name="工作协调" id="18585" />

**求差集：**

```js
function difference(a, b) {
  return new XSet([...a].filter(it => !b.has(it)))
}
```

差集也就是从 `a` 中去掉 `b` 中有的元素，用 `filter` 过滤即可。

**求交集：**

```js
function intersection(a, ...bSets) {
  // 从a中筛选出在bSets的每个set都出现的元素
  return new XSet([...a].filter(it => bSets.every(set => set.has(it))))
}
```

这里就上难度了，因为我们需要求的是 **多个集合的** 交集，传入的第二个参数是一个变长参数。我们的基本思路是从 `a` 中筛选出在 `bSets` 的每个 `set` 都出现的元素。

当然多个集合的交集也是两个集合交集的一个推广，所以我们也可以用 `reduce` 来进行归约，让 `bSets` 的每个集合都和 `a` 做一次交集操作：

```js
function intersection2(a, ...bSets) {
  return new XSet(bSets.reduce((acc, cur) =>
    [...acc].filter(it => cur.has(it)), [...a]))
}
```

**求并集：**

求并集就不能再用 `filter` 了，因为得到的元素可能比 `a` 还要更多。有一个非常简单的思路是，我们可以打散所有集合中的元素，将其放在一个数组里，并转成集合来进行去重，就得到了它们的并集：

```js
function union(a, ...bSets) {
  return new XSet([...a, ...bSets.flatMap(set => [...set])])
}
```

这里要注意的是，因为 `XSet` 继承自 `Set`，所以可以直接用 `...` 来打散集合中的元素。但是 `flat` 是不支持对子元素是非数组对象（如普通的可迭代对象，如集合）操作的，例如：

```js
[new Set([1, 2]), new Set([3, 4])].flat()
```

实际上不会展平成 `[1, 2, 3, 4]`，而是保持原样： `[Set(2), Set(2)]`（📢 这是非常反直觉的，值得注意）。所以我们需要用 `flatMap` 来代替 `flat`，先将子元素转成数组再进行展平。

求并集还有一种思路，使用归约的方法逐渐构造出数组来：

```js
function union2(a, ...bSets) {
  return new XSet(bSets.reduce((acc, cur) => {
    return [...acc, ...cur] // 重复也没关系，XSet会自动去重
  }, [...a]))
}
```

本题比较深刻地考察了函数式编程的知识。事实上 ES 的新版本也为 `Set` 提供了集合运算。
