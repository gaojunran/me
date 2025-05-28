---
title: 蓝桥杯 2022 年国赛题解（二）
date: 2025-05-28T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解！😎

## 开学礼物大放送

题目：<LanqiaoLink name="开学礼物大放送" id="2442" />

又是一道还原页面布局的题目，这里就略过不讲了。

## 权限管理

题目：<LanqiaoLink name="权限管理" id="2443" />

这是一道使用 jQuery 的题目，因为这两年已经不考察了，所以我们换用原生 JavaScript DOM API 来实现。

第一问要求我们异步获取数据，并渲染到页面上。要注意我们渲染后的内容会在后面数据动态修改时同步修改，所以最好抽出一个函数 `render()` 来重新渲染页面：

```js
let data
function getData() {
  fetch('./js/userList.json')
    .then(res => res.json())
    .then((_data) => {
      data = _data
      render()
    })
}
function render() {
  const userList = document.querySelector('#userList')
  userList.innerHTML = `
  <tr>
          <td>用户</td>
          <td>权限</td>
  </tr>
  `
  data.forEach((row) => {
    document.querySelector('#userList').innerHTML += `
        <tr>
          <td>${row.name}</td>
          <td>${row.right ? '管理员' : '普通用户'}</td>
        </tr>
      `
  })
}
```

在首次请求数据和后面修改数据时，都调用一次 `render()` 函数，这样就能保证页面内容与数据同步了。

接着我们需要实现将 `option` 从一个下拉框移动到另一个下拉框的功能：

```js
function toggle(toRight, options) {
  if (toRight) {
    options.forEach((option) => {
      leftSelect.removeChild(option)
      rightSelect.appendChild(option)
      option.selected = false
    })
  }
  else {
    options.forEach((option) => {
      rightSelect.removeChild(option)
      leftSelect.appendChild(option)
      option.selected = false
    })
  }
}
```

传入一个布尔值 `toRight`，表示是否将 `option` 移动到右边。`options` 是一个 `NodeList`，表示要移动的 `option` 集合。

还要实现在 `data` 中修改权限，并重新渲染页面的功能：

```js
function changeAccess(right, changeList) {
  changeList
    .map(option => option.value)
    .forEach((value) => {
      data.find(member => member.name === value).right = right
    })
  render()
}
```

先从 Element 中提取出 `value`，然后在 `data` 中找到对应的用户，修改其权限，最后重新渲染页面。

最后如何调用这两个函数呢？来看一下：

```js
$('#add').click(() => {
  // console.dir(leftSelect)
  const options = [...leftSelect.selectedOptions]
  toggle(true, options)
  changeAccess(true, options)
})
$('#addAll').click(() => {
  const options = [...leftSelect.options]
  toggle(true, options)
  changeAccess(true, options)
})
$('#remove').click(() => {
  const options = [...rightSelect.selectedOptions]
  toggle(false, options)
  changeAccess(false, options)
})
$('#removeAll').click(() => {
  const options = [...rightSelect.options]
  toggle(false, options)
  changeAccess(false, options)
})
```

注意！我们必须将 `left.selectedOptions` 拷贝出来，因为如果你将 `left.selectedOptions` 传入 `toggle`，在 `toggle` 函数内部会在 **循环内部修改被迭代的对象**，导致结果出错！

> 建议通过 JavaScript DOM API 得到的类数组、可迭代对象，都应该拷贝成数组在使用，这样既安全，又可以方便地使用数组的 API。

还有一个问题，我是如何知道 `selectedOptions` 这个属性的？肯定不是因为我背下来了这个属性，而是使用了 `console.dir` 来查看 DOM 对象的全部 JS 属性 ，然后找到的。这个经验非常有用。

## 一起会议吧

题目：<LanqiaoLink name="一起会议吧" id="2444" />

一道 Vue2 的题目，简单看一下就行，现在考察 Vue3 了。

我们重点看下第三问和第五问，这两问可以封装同一个计算属性 `displayData`，对异步请求的结果 `data` 实现计算，遵循以下规则：

- 始终把当前登录的用户排在第一位；
- 根据三个状态按钮，决定返回空、返回仅登录用户或返回所有数据。

看下代码：

```js
const WindowState = {
  Zero: 1,
  OnlyLogin: 2,
  All: 3
}
displayData() {
  if (!this.data || !this.select) {
    return this.data
  }
  let allData = [this.data.find(it => it.name == this.select), ...this.data.filter(it => it.name != this.select)]
  if (this.windowState == 1) {
    return []
  } else if (this.windowState == 2) {
    return [allData[0]]
  } else {
    return allData
  }
}
```

在计算属性中，如果 `select` 为空，则直接返回 `data`。接着计算 `allData`，将当前登录的用户放在第一位；然后根据 `windowState` 返回对应的数据。

“将当前登录的用户放在第一位” 这个逻辑，你可以像我一样写：`[this.data.find(it => it.name == this.select), ...this.data.filter(it => it.name != this.select)]`，手动组装一个新数组。如果你第一时间想到是使用 `sort` 方法来解题，也可以这样做：

```js
const allData = data.sort((a, b) => {
  if (a.name === this.select)
    return -1
  if (b.name === this.select)
    return 1
  return 0
})
```

本题的判题有点问题，可能会无法通过。

## JSON 生成器

题目：<LanqiaoLink name="JSON 生成器" id="2446" />

一道考察正则表达式为主的综合题，要求我们替换模板字符串中的占位符，生成一个 JSON 字符串。

首先先来处理 `{{bool}}` 和 `{{integer(3,5)}}` 这种占位符：

```js
const patterns = {
  bool: /\{\{bool\(\)\}\}/,
  integer: /\{\{integer\((\d+),\s*(\d+)\)\}\}/,
  repeatFixed: /\{\{repeat\((\d+)\)\}\}/,
  repeatRange: /\{\{repeat\((\d+),\s*(\d+)\)\}\}/
}

// 生成指定范围内的随机整数
function generateBetween(start, end) {
  return Math.floor(Math.random() * (end - start + 1)) + start
}

// 替换模板值为随机结果
function replacePlaceholders(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => {
    if (typeof value !== 'string')
      return [key, value]

    if (patterns.integer.test(value)) {
      const [_, start, end] = value.match(patterns.integer)
      return [key, generateBetween(+start, +end)]
    }

    if (patterns.bool.test(value)) {
      return [key, Math.random() > 0.5]
    }

    return [key, value]
  }))
}
```

在函数 `replacePlaceholders` 中，我们遍历 `obj` 的每一个键值对，如果值是字符串，则判断是否匹配正则表达式，如果匹配，则替换为随机结果。

再来处理 `{{repeat(3)}}` 和 `{{repeat(3,5)}}` 这种占位符（仅在 `data` 为数组时处理）：

```js
function generateData(data) {
  if (!Array.isArray(data))
    return replacePlaceholders(data)

  const [repeatExpr, template] = data // repeatExpr 为 第一项

  const times = patterns.repeatFixed.test(repeatExpr)
    ? +repeatExpr.match(patterns.repeatFixed)[1]
    : repeatRange.test(repeatExpr)
      ? generateBetween(...repeatExpr.match(patterns.repeatRange).slice(1, 3).map(Number))
      : 1

  return Array.from({ length: times }, () => replacePlaceholders(template))
}
```

对 `times` 的计算我们精心地使用函数式的写法整合在了一起：

- 如果匹配正则 `repeatFixed`，则直接取匹配结果中的数字作为 `times`；
- 如果匹配正则 `repeatRange`，则生成一个在指定范围内的随机整数作为 `times`。
- 如果均不匹配，则说明不存在占位符，`times` 自然为 1。

函数式的写法讲究的是一气呵成，如果你对自己一口气写一长段代码的能力表示怀疑的话，用正常写法也未尝不可。
