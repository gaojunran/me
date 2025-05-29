---
title: 蓝桥杯 2022 年国赛题解（三）
date: 2025-05-29T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解！😎

## 商城管理系统

题目：<LanqiaoLink name="商城管理系统" id="2447" />

本题又是一个树形结构的题目，可以使用 BFS / DFS 来解决：

回顾一下题目，我们需要进行一个 JSON 格式的转换：

```json
[
  { "parentId": -1, "name": "商品管理", "id": 1, "auth": "cart" },
  { "parentId": 1, "name": "商品列表", "id": 4, "auth": "cart-list" },
  { "parentId": -1, "name": "添加管理员", "id": 10, "auth": "admin" }
]
```

转换成：

```json
[
  {
    "parentId": -1,
    "name": "商品管理",
    "id": 1,
    "auth": "cart",
    "children": [
      {
        "parentId": 1,
        "name": "商品列表",
        "id": 4,
        "auth": "cart-list",
        "children": []
      }
    ]
  },
  {
    "parentId": -1,
    "name": "添加管理员",
    "id": 10,
    "auth": "admin",
    "children": []
  }
]
```

根据 `parentId` 来插入对应节点的 `children` 数组中。这是一个非常常见的需求。

首先我们定义收集结果的数组 `menus`，栈 `stack`，同时将所有无父节点的节点入栈：

```js
let menus = []

// 初始化所有菜单的 children
menuList.forEach((menu) => {
  menu.children = []
})

let stack = [...menuList
  .filter(menu => menu.parentId === -1)
  .map(menu => ({
    menu,
    siblings: menus
  }))]
```

可以看出，我们在栈中除了存储菜单这个对象本身外，还存储着 `siblings`，也就是它的兄弟节点构成的数组，这样我们就可以方便地将这个节点插入树中。

接着我们开始遍历栈：

```js
while (stack.length > 0) {
  let { menu, siblings } = stack.pop()

  siblings.push(menu)

  // TODO
}
```

每次弹出栈中的一个元素，并将这个菜单插入其父节点的 `children` （也就是这个菜单的 `siblings`）中。

接着我们需要找到这个菜单的子节点，并插入到 `stack` 中：

```js
stack.push(...menuList
  .filter(menu => menu.parentId === menu.id)
  .map(menu => ({
    menu,
    siblings: menu.children
  })))
```

子节点的 `siblings` 应该是父节点的 `children`，所以我们将 `menu.children` 作为 `siblings` 传入。

这样就实现功能了！

## 天气趋势

题目：<LanqiaoLink name="天气趋势" id="2466" />

这是一道逻辑非常复杂的题目，而且是 Vue 2，我是将题目用大模型翻译成 Vue 3 组件式 API 后，使用本地的环境完成的。

我们只关注难点，即如何在图表中动态更新当前选中月份 / 未来七天的数据。

来看一下大致的框架：

```js
watchEffect(() => {
  if (!chart.value || !chartOptions.value || !data.value)
    return

  if (isCurrMonth.value && !isWholeMonth.value) {
    // 显示未来七天（支持跨月）TODO
  }
  else {
    // 显示整月数据
    const thisMonthData = data.value.find(item => selectedMonth.value in item)[selectedMonth.value]
    chartOptions.value.xAxis[0].data = Array.from({ length: thisMonthData.length || 31 }, (_, i) => i + 1)
    chartOptions.value.series[0].data = thisMonthData
  }
  chart.value.setOption(chartOptions.value, true)
}, { immediate: true })
```

对于显示整月数据的情况比较简单，直接使用 `Array.from` 生成日期数组（X 轴），然后使用 `find` 找到当前选中的月份，再取出数据（Y 轴）即可。

而对于显示未来七天数据的功能则比较复杂：

```js
// 显示未来七天（支持跨月）
const today = new Date()
const resultTemps = []
const resultLabels = []

for (let i = 0; i < 7; i++) {
  const date = new Date(today)
  date.setDate(today.getDate() + i) // 拿到这天对应的日期
  const monthName = date.toLocaleString('en-US', { month: 'long' }) // 拿到这天对应的英文月字符串，如 "May"
  const day = date.getDate() // 拿到这天对应的日

  const monthData = data.value.find(item => monthName in item)[monthName]

  const dayData = monthData[day - 1] ?? null
  chartOptions.value.series[0].push(dayData)
  chartOptions.value.xAxis[0].data.push(`${date.getMonth() + 1}/${day}`) // eg. "6/2"
}
```

如果手动处理跨月的情况就太麻烦了。我们可以借助 `Date` 对象的日期加减计算来处理。先拿到对应日期的 `Date` 对象，通过 `toLocaleString` 方法拿到对应的英文月字符串，再通过 `getDate` 方法拿到对应的日（减一就是在 `data` 中的索引）。通过月和日可以拿到对应的数据。

注意这题我们是用 Vue 3 的 `watchEffect` 函数来实现的，这个 API 可以自动追踪响应式依赖，如果没有这个 API 这题做起来则更加艰难。

## 小兔子找胡萝卜

题目：<LanqiaoLink name="小兔子找胡萝卜" id="2470" />

一道非常简单的使用浏览器 API 实现的题目：

```js
const $ = ele => document.querySelector(ele).bind(this)

const blocks = [...document.querySelectorAll('.container .lawn')]
let curr = 0

// TODO：游戏开始
function start() {
  $('#move').style.display = 'block'
  $('#start').style.display = 'none'
}
// TODO：重置游戏
function reset() {
  blocks[curr].classList.remove('active')
  curr = 0
  blocks[curr].classList.add('active')
  $('#reset').style.display = 'none'
  $('#start').style.display = 'block'
  $('.result').textContent = ''
  $('.process input').value = ''
}
// TODO：移动
function move() {
  const step = +($('.process input').value)
  if (!(step === 1 || step === 2)) {
    $('.result').textContent = '输入的步数不正确，请重新输入。'
    return
  }
  $('.result').textContent = ''
  blocks[curr].classList.remove('active')
  curr += step
  blocks[curr].classList.add('active')
  if (curr === 12) {
    $('#move').style.display = 'none'
    $('#reset').style.display = 'block'
    $('.result').textContent = '哎呀！兔子踩到炸弹了，游戏结束！'
  }
  else if (curr === 23) {
    $('#move').style.display = 'none'
    $('#reset').style.display = 'block'
    $('.result').textContent = '小兔子吃到胡萝卜啦，游戏获胜！'
  }
}
```

## 猜硬币

题目：<LanqiaoLink name="猜硬币" id="2465" />

这是一道考察 JavaScript 的题目，要求我们补全两个函数。

函数 `findNum` 将输入框字符串中的数字 `1-9` 提取出来，并返回一个数组：

```js
// 将输入的值中 1-9 组成一个数组
function findNum(input_values) {
  return [...input_values].map(s => +s).filter(i => i >= 1 && i <= 9)
}

function findNum2(input_values) {
  return input_values.replace(/[^1-9]/g, '').split('').map(Number)
}
```

这里我们给出两种做法，不管用不用正则，代码都很简洁。

函数 `randomCoin` 从 1-9 中选择三个不重复的随机数：

```js
function randomCoin() {
  return Array.from({ length: 9 }, (_, i) => i + 1)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
}
```

做法如上，我们对 1-9 的数组进行随机排序，然后取前三个即可。随机的算法是产生一个 `[-0.5, 0.5)` 的随机数，然后根据这个随机数的大小来决定是否交换两个元素的位置。

当然你第一时间可能没有想到这个函数，而是想生成 1-9 之间的随机数，但是要注意生成的随机数可能重复，如果当前已经生成的随机数中已经存在这个数，则重新生成，直到生成三个不重复的数为止：

```js
function randomCoin() {
  const result = []
  while (result.length < 3) {
    const num = Math.floor(Math.random() * 9) + 1
    if (!result.includes(num))
      result.push(num)
  }
  return result
}
```

---

2022 年的题目都非常的繁琐，<LanqiaoLink name="新增地址" id="2465" /> 和 <LanqiaoLink name="阅读吧" id="2464" /> 这两题有点繁琐而且没有什么有价值的内容，所以这里略过不讲了。

至此我们讲完了 3 年全部的国赛题目，希望能对你有帮助！🎉
