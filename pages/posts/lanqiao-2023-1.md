---
title: 蓝桥杯 2023 年国赛题解（一）
date: 2025-05-10T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 植物灌溉

题目：<LanqiaoLink name="植物灌溉" id="18465" />

一道典型的签到题，只考了一个 `grid` 的 CSS 属性，而且给了提示。注意编号（点击图片放大）：

<img class="!w-1/2 !mx-auto" src="/images/lanqiao/image1.png" />

根据这个编号就可以指定 grid 的左右上下范围。`grid-area`是`grid-row-start`、`grid-column-start`、`grid-row-end`、`grid-column-end`的简写。

```css
.treatment {
  grid-area: 1 / 2 / 4 / 6; /* [!code ++] */
}
```

## 萌宠小玩家

题目：<LanqiaoLink name="萌宠小玩家" id="18468" />

第一问非常简单，是经典的 DOM 操作，要注意文本框的内的内容属性是`value`而不是`textContent`。

```js
verifyName() {
    // TODO: 待补充代码
    if (nickname.value == "") {
      vail_name.style.display = "block"
    } else {
      vail_name.style.display = "none"
      this.name = nickname.value
    }
  }
```

第二问要求我们向一个 DOM 元素中添加子元素，并要求限制数量为 10 个。

这里我们有两个基本思路：使用`innerHTML`属性获得 DOM 元素的 HTML，或者使用`children`属性获得 DOM 元素的子元素列表。

显然第二种思路是更简单的，不过如果你想练习一下，不妨先思考下第一种如何实现限制 10 个元素。

对了，使用正则表达式！

```js
showLog(record) {
    // TODO: 待补充代码
    list.innerHTML = (`<div>${record}</div>` + list.innerHTML)
              .replace(/(?<=((<div>.*<\/div>){10}))(.*)/, "")
  }
```

这里我们使用了一个前瞻断言，将 10 个`<div>`元素之后的所有内容都替换为空字符串。

第二种思路：

```js
showLog(record) {
    // TODO:  待补充代码
    let children = [...list.children]
    let ele = document.createElement("div")
    ele.textContent = record
    children.unshift(ele)
    list.replaceChildren(...children.slice(0, 10))
  }
```

要注意 `children` 属性返回的是一个类数组对象而不是数组，所以要先用`[...]`将其转换为数组。之后我们可以创建一个`element`，然后使用`unshift`方法将其插入到数组的开头，最后使用`replaceChildren`方法将数组中的元素替换到 DOM 元素中（这个方法我也是偶然间发现的😂）。

如果没有`replaceChildren`方法，可以对子元素调用`remove()`方法自杀：

```js
for (let i = 10; i < children.length; i++) {
  children[i].remove()
}
```

或者更简单地，在长度大于 10 的时候删除末尾元素：

```js
if (list.children.length > 10)
  list.lastChild.remove()
```

## element ui 轮播图组件二次封装

题目：<LanqiaoLink name="element ui 轮播图组件二次封装" id="18473" />

这题主要考察的是 Vue 2，我们现在已经不考察 Vue 2了，所以简单看看写法即可：

```vue
<li
    v-for="(_, idx) in images"
    :class="{point: true, active: index == idx}"
    :key="idx"
    @click="setActive(idx)"
></li>
```

要关注 `v-for` 中获取索引的写法、绑定样式的写法，绑定样式还可以写成数组形式：`:class="['point', index == idx ? 'active' : '']"`。

```vue
<script>
module.exports = {
  data() {
    return {
      index: 0
    }
  },
  props: { ... },
  methods: {
    onCarouselChange(index) {
      this.index = index;
    },
    setActive(index) {
      this.$refs.carousel.setActiveItem(index);
    },
  }
}
</script>
```

这是一个典型的 Vue 2 写法，下面给出等价的 Vue 3 写法：

```vue
<script setup>
import { ref } from 'vue'

const index = ref(0)

const carousel = ref(null)

function onCarouselChange(i) {
  index.value = i
}

function setActive(i) {
  carousel.value.setActiveItem(i)
}
</script>
```

接着按照给出的API文档的提示，给 Element UI 组件绑定上事件即可。

## 抢红包啦

题目：<LanqiaoLink name="抢红包啦" id="18466" />

```js
function randomAllocation(total, n) {
  //  TODO: 待补充代码
  let result = Array(n).fill(0.01)
  total -= n * 0.01
  for (let i = 0; i < result.length - 1; i++) {
    let money = total * Math.random()
    result[i] += money
    total -= money
  }
  result[result.length - 1] += total
  return result.map(it => +it.toFixed(2))
}
```

思路很简单，先给每个红包分配 0.01 元，然后剩下的钱随机分配即可。每次给剩余的钱分配一个 0 ~ 1 的权重作为其中一个人的红包金额。最后一个人吃掉所有剩下的钱。最后使用`toFixed`方法（返回字符串）和加号的类型转换，将结果保留两位小数。

这应该是一个比较简单的做法，或者如果你想复习一下如何生成一个随机范围的数，可以参考另一个做法：

```js
function randomAllocation(total, n) {
  //  TODO: 待补充代码
  const res = [];
  let min = 0.01;
  for (let i = 0; i < n - 1; i++) {
    let max = total - (n - i - 1) * min;
    let money = +(Math.random() * (max - min) + min).toFixed(2);
    res.push(money);
    total = total - money;
  }
  res.push(+total.toFixed(2));
  return res;
}
```

> 话说微信的红包算法是怎么实现的呢？
