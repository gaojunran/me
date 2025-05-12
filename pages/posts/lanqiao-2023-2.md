---
title: 蓝桥杯 2023 年国赛题解（二）
date: 2025-05-11T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 讨论区

题目：<LanqiaoLink name="讨论区" id="18472" />

这题我没能打开参数标注的页面，而且看题解区说的代码量巨大。建议大家遇到这个题就别做了，有点浪费时间。

## GitHub Contribution

题目：<LanqiaoLink name="GitHub Contribution" id="18475" />

第一问是简单的数据请求，因为函数没有用`async`修饰，所以这里用了链式`then`调用：

```js
fetch('./data.json').then(res => res.json()).then((res) => {
  // console.log(res);
  data = res.map(it => [it.time, it.contributions])
  console.log(data)
  render(data)
})
```

注意，一定要把`render`函数放在`then`里，因为`then`只是注册了钩子，并没有阻塞代码的执行。

后面第二问完全没难度，只要根据 API 正确地配置参数即可：

```js
calendar: {
    range: "2022",
    top: 80,
    left: "center",
    cellSize: 15,
    itemStyle: {
      color: "#ebedf0",
      borderWidth: 1
    },
    splitLine: false,
    yearLabel: false
},
tooltip: {
        formatter: (params) => {
          // console.log(params);
          return `<div id="tooltip">日期：${params.data[0]}<br>提交次数：${params.data[1]}</div>`
        }
}
```

`calender` API 中有一个`borderWidth`属性，它只能接受数值型，不能写成`borderWidth: "1px"`（文档没有强调这一点，很容易踩坑），否则会得到期望之外的结果。

`tooltip` API 中没有明确告诉你`formatter`参数`params`是什么，可以自己打印出来看一下。打印出的结果我们发现有用的数据在`data`属性下，所以就可以直接获取了！

## 文本查重小能手

题目：<LanqiaoLink name="文本查重小能手" id="18471" />

第一问依然是数据请求。如果想在 JavaScript 脚本顶部使用`await`异步操作，可以用下面的立即执行表达式：

```js
(async () => {
  const res = await fetch('./data.json')
  const data = await res.json()
  articles = data.data
})()
```

顶层直接使用`await`是一个新特性，蓝桥杯的 Node 版本和 ES 版本应该用不了。

第二问要建立一个下拉框选中内容改变的回调。可以使用`change`事件：

```js
articleSelect.addEventListener('change', (event) => {
  const value = event.target.value // 从事件的`target`中拿出`value`
  compareText.textContent = articles[value]
})
```

这么写也是等价的。要注意`onchange`是一个属性，要给它赋值。这么做后，会覆盖默认的`change`事件。

```js
articleSelect.onchange = (event) => {
  const value = event.target.value
  compareText.textContent = articles[value]
}
```

第三个问想百分百实现还是挺难的，下面给出我的思路：

```js
function wordSegmentation(words) {
  // TODO：待补充代码
  const letters = Array.from({ length: 52 }, (_, i) =>
    String.fromCharCode(i < 26 ? i + 65 : i - 26 + 97)) // 生成 A-Z 和 a-z
  const seps = '，。「」【】；：’‘“”、？》《——……！'
  let result = [...letters, ...stopWords, ...seps].reduce((acc, cur) => {
    return acc.flatMap(it => it.split(cur))
  }, [words]).filter(it => it.trim() !== '')
  // console.log(result)
  return result
}
```

这里比较难理解的是这个`flatMap`和`reduce`的用法。我想遍历所有分隔符（这里我把所有英文字母、中文标点和停用词都作为分隔符），每次循环实际上是把当前数组中的每个元素按照这个分隔符分割，然后组合成一个新数组提供给下次循环（下次循环是下一个分隔符）。虽然我们使用了函数式编程的写法，但你要明确这里实际上是两层嵌套循环。

然后看了一下题解，发现有人比我写得好。比如说`split`实际上可以接受正则表达式，所以就不用费劲去构造`letters`变量，可以直接这么写：

```js
const letters = /[A-Z]/gi // 使用`i` flag 可以同时匹配大小写
```

这里放一个 `Spring.split` 的 [链接](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split)，可以在里面学习其更多用法。

还有更优雅的一行正则写法：

```js
function wordSegmentation(words) {
  // TODO：待补充代码
  return words.match(new RegExp(`[^${[...stopWords]}A-Z\s.。,，;；()（）、|}{[\]：:'"<>?/]+`, 'gi'))
}
```

在编写这个正则时，你可以先用`/regex/gi`这种写法，来根据 VS Code 的高亮检查正则是否正确。然后再转成`new RegExp`这种写法。

**正则表达式**是一个非常高频的考点，强烈建议认真学一下，包括反向捕获、前后断言、捕获组这种高级特性也要学。

## 找到未引用的图片

题目：<LanqiaoLink name="找到未引用的图片" id="18470" />

提示：这是一道 Node.js 的题目，职业组可以跳过。

这个题的核心难点已经给好我们了，只需要把提供的函数`traversalDir`和`searchImage`封装一下，编写核心的逻辑：

```js
async function findUnlinkImages() {
  // TODO 请通过 Node.js 在此处继续完成代码编写
  const mds = await traversalDir(articlesPath)
  const images = await traversalDir(imagesPath)
  let result = mds.flatMap((mdpath) => {
    const md = fs.readFileSync(path.join(articlesPath, mdpath), 'utf8')
    return searchImage(md)
  }).map(it => path.basename(it))
  // 这里的 result 应该会有重复的图片，但因为我们要后面做存在性检查，所以不去重也是可以的
  console.log(result)
  return images.filter(img => !result.includes(img))
}
```

有几个值得关注的地方：

1. `fs.readFileSync`默认返回的是`Buffer`，如果想要得到字符串需要用`utf8`参数指定编码。
2. `path.basename`返回路径中的文件名。
3. 做对了这题之后自己读一下他给的两个函数具体是如何实现的，尤其是搜索图片中使用的正则表达式，几乎所有符号都需要转义。认真读一下他给的实现，说不定下次就不给了呢。

## 表单生成器（大学组）

题目：<LanqiaoLink name="表单生成器（大学组）" id="18477" />

第一问比较简单，直接传参数和绑定事件即可：

```html
<template v-if="item.type=='checkbox'">
  <my-checkbox v-for="option in item.options" :label="option.label" v-model="item.value">{{option.name}}</my-checkbox>
</template>
<my-rate v-if="item.type=='rate'" v-model="item.value"></my-rate>
<my-select v-if="item.type=='select'" v-model="item.value" :options="item.options"></my-select>
```

这里需要注意的是：你需要判断一下`my-checkbox`表示的是一个`checkbox`还是多个，你可以从`my-checkbox`定义的`props`中看出，`label`被绑定到`id`上，一定是一个字符串而不是一个数组。

为什么要使用`<template>`呢？Vue 不建议把`v-if`和`v-for`放在同一个组件上，会有歧义问题。分为两种情况：

- 如果要`v-if`在外层，即**先进行一个判断，如果判断为假则`v-for`全都不渲染**。这时可以用本题中的做法，将`v-if`放在外层的`<template>`中。详见[官网](https://vuejs.org/guide/essentials/conditional.html#v-if-on-template)
- 如果要`v-for`在外层，即**先进行一个循环，如果循环中某个元素判断为假则不渲染这个元素**。这时可以将`v-for`放在外层的`<template>`中，详见[官网](https://vuejs.org/guide/essentials/list.html#v-for-with-v-if)。

Vue 3 中 `v-if` 的优先级高于 `v-for`（ `v-if` 条件无法访问 `v-for` 范围内的变量），但我们不建议使用这个优先级顺序，而是像上面两种情况一样显式地区分。

这道题二三问的主要难点在于题干提供的信息太少了，很多变量都需要从使用中去推断，可以说是出题人刻意使绊子。

先来看`select.js`：

```js
const selectTemplate = `
<div class="select">
  <div class="input" @click="openValue">
    <input id="selectVal" v-model="content" type="text" placeholder="请点击选择">
    <span class="tri" :class="{tri_up: show}"></span>
  </div>
  <div class="list" v-show="show">
    <ul>
      <li @click="getvalue(item)" v-for="(item, index) in listData" :key="index">{{ item.name }}</li>
    </ul>
  </div>
</div>
`

Vue.component('my-select', {
  template: selectTemplate,
  props: ['options', 'value'],
  data() {
    return {
      show: false
    }
  },
  computed: {
    listData() {
      return this.options // 根据 props 自动返回 list 数据
    },
    content: {
      get() {
        // 根据传入的 `value` 和 `options` 自动更新 `content`
        const selected = this.options.find(i => i.label === this.value)
        return selected ? selected.name : ''
      },
      set(newValue) {
        // 设置 content 时，触发对应的值变化
        const selected = this.options.find(i => i.name === newValue)
        if (selected) {
          this.$emit('input', selected.label) // 更新父组件传入的 `value`
        }
      }
    }
  },
  methods: {
    getvalue(val) { // 更新选中值
      this.content = val.name // 更新 content，同时触发父组件 input
      this.show = false
    },
    openValue() { // 打开/关闭下拉框
      this.show = !this.show
    }
  }
})
```

可以看出`content`绑定在`v-model`上，表示当前下拉框选中的值。根据第三问的要求，`value`是动态变化的，所以我们要根据传入的`value`来动态更新`content`（所以要给`content`绑定`get`方法）。同时，当手动在下拉框中更新选中值（触发`getvalue`方法）时，也要更新`value`（所以给`content`绑定`set`方法）。

可以画出数据流图：

<img src="/images/lanqiao/image2.png" class="!w-1/2 !mx-auto" alt="数据流图" />

实际上让一个计算属性 **可写（`set`方法）** 是一个不太好的编程实践，会破坏单向数据流。你也可以把`content`定义成一个普通的响应式变量；监听参数`value`，在其变化时改变`content`；同时监听`content`，在其变化时触发`input`事件。

> 如果你思考得足够多，你可能怀疑这是一个死循环：`value改变 -> content改变 -> 触发input事件 -> value改变`。实际上在值没有实际改变的时候，不会触发 `watch / computed / render`，所以不会陷入死循环。

<!-- 实际上 Vue3 中对于 `v-model` 的机制有着较大的改变，现在绑定的是 `modelValue` 属性，监听的是 `update:modelValue` 事件。（以前绑定的是 `value` 属性，监听的是 `input` 事件）。如果是使用 Vue3.4+，可以简写作： -->

再来看`checkbox.js`，这个比`select.js`简单一些，就不再赘述了。

```js
const checkboxTemplate = `
<div class="radio-box">
  <input type="checkbox" :checked="isCheck" @change="change" :id="label">
  <label :for="label" class="radio-stype check-box"></label><span> <slot /> </span>
</div>`

Vue.component('my-checkbox', {
  template: checkboxTemplate,
  props: ['label', 'value'],
  // TODO 请在此继续完成组件代码的编写
  computed: {
    isCheck() {
      return this.value.includes(this.label)
    }
  },
  methods: {
    change(event) {
      let arr = [...this.value] // 创建新数组，避免直接修改 props
      if (event.target.checked) {
        arr.push(this.label)
      }
      else {
        arr = arr.filter(it => it !== this.label)
      }
      this.$emit('input', arr)
    }
  }
})
```

这道题是一个典型的「computed model（双向绑定计算属性）」模型，我专门写了一篇[博客](/posts/vue-computed-model)来介绍这个模型，可以去读一下，希望对你有所帮助。
