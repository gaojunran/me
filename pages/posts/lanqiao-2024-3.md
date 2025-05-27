---
title: 蓝桥杯 2024 年国赛题解（三）
date: 2025-05-25T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 国际化适配

题目：<LanqiaoLink name="国际化适配" id="18592" />

这是一道比较难的题，而且处在第九题的位置，可能实际赛场上都没机会看到这道题😂。

第一问要求我们封装一个可以返回 `t` 的函数，使用 `t` 函数可以实现将一个语言的字符串转换成另一个语言的。字符串的映射来自三个变量 `zh-CN`、`en-US` 和 `ja-JP`，我们要先从字符串参数 `lang` 得到字符串的映射变量：

```js
const mapping = {
  zh_CN,
  en_US,
  ja_JP,
}[lang] || ja_JP
```

这段代码非常简洁，使用了对象字面量简写语法，表示从 `"zh_CN"` 映射到 `zh_CN` 这个变量。从这个映射中使用 `lang` 这个键拿出对应的值（是一个对象），如果提供了预期之外的 `lang`，则默认返回 `ja_JP`。

接着，我们要把如下这种嵌套对象的字符串转换成这种形式：`"nav.study"`。因为本例中最多只有一层嵌套，所以就不用像上次「代码量统计」那道题一样使用递归了。

```js
const zh_CN = {
  // ...
  nav: {
    study: '学习',
    lanqiao: '蓝桥杯',
    // ...
  },
  // ...
}
```

给出代码：

```js
let trans = Object.entries(mapping).flatMap(([k, v]) => {
  if (typeof v == 'object') { // 有嵌套
    return Object.entries(v).map(([subK, subV]) => {
      return [`${k}.${subK}`, subV]
    })
  }
  else { // 没嵌套
    return [[k, v]]
  }
})
```

这段代码有点复杂，我们拆解开来理解：我们使用 `flatMap` 遍历每个键值对，对于没有嵌套的键值对来说可以直接返回**一项**；而对于有嵌套的对象来说，它在最后的数组中应该占**多项**，每一项都应该是`["nav.study", "学习"]`这种形式。所以我们在有嵌套的逻辑内部将其转换成这种形式，再返回。本题中 `flatMap` 的回调应该返回的是二维数组，然后 `flatMap` 会将这个二维数组展平成一维数组；所以对于没有嵌套的键值对来说，应该返回 `[[k, v]]` 这种形式。

最后一个需求需要在转换之后的 `trans` 字符串中动态替换来自 `option` 字典的变量：

```js
let text = Object.fromEntries(trans)[langKey]
option && Object.entries(option).forEach(([k, v]) => {
  text = text.replace(`$$${k}$$`, v)
})
```

这里 `option && ...` 是一个逻辑短路。如果函数参数中没有提供 `option`，则直接跳过后面的逻辑以防报错。这段代码很简单，想一想能否简化成一行代码呢？

对了！就是我们之前讲过的`replace` 回调函数！

```js
text = option
  ? text.replace(/\$\$(\w+)\$\$/g, (match, key) =>
      key in option ? option[key] : match)
  : text
```

我们可以用正则来匹配所有 `$$` 包围的变量，然后使用回调函数来替换。如果这个变量在 `option` 中存在，则替换成对应的值，否则**保持原样**。

第二问和第三问都很简单，在此直接给出代码，不再赘述：

```js
function getUrlParams(url) {
  // TODO：待补充代码 目标 2
  if (url.includes('?')) {
    return Object.fromEntries(url.split('?')[1].split('&').map(item => item.split('=')))
  }
  else { // 注意要处理这种不包含查询参数的情况
    return []
  }
  // TODO：END
}

// TODO: 待补充代码 目标 3
watch(selectLang, (newVal) => {
  const [lang, theme] = newVal.split('__')
  console.log(lang, theme)
  history.replaceState({}, null, `?lang=${lang}&theme=${theme}`)
  ctx.emit('url-change')
})
// TODO: END
```

## GitHub Desktop

题目：<LanqiaoLink name="GitHub Desktop" id="18594" />

这题的前三个问都是非常基础的省赛难度。我们可以聚焦于第四问：

第四问要求我们封装一个 `useRefHistory` 这个 `composables` 函数，使用栈来记录一个响应式变量 `ref` 的值历史。

> [VueUse](https://vueuse.org/) 提供了这个函数。还有其它优秀的基于**组合式和响应式**的函数你可以在其文档中找到！

我们来看一下思路：

我们要维护一个历史记录数组（`history`），记录每次值的变化。用户可以通过调用返回的 `undo` 和 `redo` 函数来实现值的回退和前进操作。主要功能包括：

1. 通过 `watch` 监听 `someRef` 的值变化，每次变化时将新值深拷贝后存入历史记录数组。
2. 维护一个数组 `history` 保存值的快照，`idx` 指向当前历史记录的索引，`flag` 用于区分**手动更改和撤销/重做操作**。
3. `undo` 函数回退到上一个历史状态，`redo` 函数前进到下一个历史状态，边界检查防止越界。

#### 初始化

```javascript
const { ref, watch } = Vue
const history = [deepClone(someRef.value)]
let idx = 0
let flag = true // 手动更新state而不是调用Undo redo
```

- `history` 初始化时包含 `someRef` 初始值的深拷贝。深拷贝确保历史记录中的值是独立的，不会因后续修改而改变。
- `idx` 是历史记录的当前索引，初始为 0（指向第一个历史记录）。
- `flag` 是一个布尔值，用于区分值的变化是用户手动修改（`flag = true`）还是通过 `undo`/`redo` 触发的（`flag = false`）。要注意这两种情况下的处理逻辑不同：如果是手动修改，则记录历史；如果是 `undo`/`redo` 触发的，则不记录历史。

#### 监听 `ref` 变化

```javascript
watch(someRef, (newValue, _) => {
  if (flag) {
    const cloned = deepClone(newValue)
    const current = history[idx]

    // 如果新值和当前值相同，不添加进历史
    if (JSON.stringify(cloned) === JSON.stringify(current))
      return

    // 清除 redo 历史
    history.splice(idx + 1)
    history.push(cloned)
    idx = history.length - 1
  }
  else {
    flag = true
  }
}, { deep: true })
```

- 使用 `watch` 监听 `someRef` 的值变化，`{ deep: true }` 确保对**对象内部的深层变化也能触发监听**。
- 当 `flag` 为 `true`（表示**用户手动修改了值**）：
  - 深拷贝新值（`cloned`）。
  - 检查新值与当前历史记录值（`history[idx]`）是否相同（通过 `JSON.stringify` 比较序列化结果）。如果相同，则不记录，避免重复历史记录。
  - 如果不同，调用 `history.splice(idx + 1)` 清除当前索引之后的所有历史记录（即清除“重做”历史）。
  - 将新值推入 `history` 数组，更新 `idx` 为最新记录的索引。
- 如果 `flag` 为 `false`（表示变化由 `undo` 或 `redo` 触发），仅将 `flag` 重置为 `true`，不记录历史。

> 为什么要**清空「重做历史」？**
> 我在评测平台试了，如果不做这个功能也可以通过评测。但是思考一个场景：当用户 `undo` 后，又再次修改值，那么 `redo` 会发生什么呢？我们期望的是 `redo` 后回到用户修改前的值（也就是 `undo` 后的值），而不是回到 `undo` 之前的值。所以我们需要清空「重做历史」。进行新修改时，未来的历史（即“重做”路径）会变得无效，因为新修改创建了一个新的历史分支。

#### 撤销功能

```javascript
function undo() {
  if (idx <= 0)
    return // 边界检查
  console.log('undo', someRef.value, history)
  flag = false
  idx -= 1
  someRef.value = deepClone(history[idx])
  console.log('undo', someRef.value, history)
}
```

- 检查是否可以撤销（`idx > 0`），如果已在历史开头则直接返回。
- 设置 `flag = false`，表示接下来的变化是由 `undo` 触发的（而不是用户主动修改的）。
- 减少索引 `idx`，指向前一个历史记录。
- 将 `someRef.value` 更新为历史记录中对应索引的值（深拷贝以避免引用问题）。

#### 重做功能

```javascript
function redo() {
  if (idx >= history.length - 1)
    return // 边界检查
  console.log('redo', someRef.value)
  flag = false
  idx += 1
  someRef.value = deepClone(history[idx])
  console.log('redo', someRef.value)
}
```

- 检查是否可以重做（`idx < history.length - 1`），如果已在历史末尾则直接返回。
- 设置 `flag = false`，表示变化由 `redo` 触发的（而不是用户主动修改的）。
- 增加索引 `idx`，指向下一个历史记录。
- 更新 `someRef.value` 为对应历史记录的值（深拷贝）。

## 文档纠错

题目：<LanqiaoLink name="文档纠错" id="18587" />

这个题目比较简单，根据业务要求进行 HTML 字符串的替换即可。

```js
function getHighlightTemp(sentence, correctList) {
  if (!correctList || correctList.length === 0)
    return sentence
  // TODO：待补充代码
  correctList.forEach((item) => {
    sentence = sentence.replace(
      item.original,
      `<span ${item.isRevised ? '' : 'class=\'highlight\''}
       data-original="${item.original}"
       data-result="${item.result}"
       data-correcttype="${item.correctType}"
       data-start="${item.start}"
       data-end="${item.end}"
       data-correctid="${item.correctId}">
          ${item.isRevised ? item.result : item.original}
       </span>`
    )
  })
  return sentence
}
```

## 井字棋

题目：<LanqiaoLink name="井字棋" id="18589" />

井字棋判断胜负的基本逻辑是每一行、每一列、两条对角线是否全为x或o。我们可以在 `checkMap` 中再封装一个函数 `isWinner` 来判断某个玩家是否获胜：

```js
function checkMap() {
  function isWinner(player) {
    // 返回布尔值
  }

  if (isWinner('x'))
    return 'x'
  if (isWinner('o'))
    return 'o'
  if (map.flat().every(cell => cell !== null))
    return true // 格子占满，平局
  return null // 暂时未分胜负
}
```

作为一个蓝桥杯高手，你首先想到的应该是最简单的方法：遍历所有情况！一个玩家在井字棋的胜利组合只有 8 种，你可以在一分钟之内轻松地列出来：

```js
function checkMap() {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  // 逻辑：所有胜利组合中存在一种组合，这种组合里的每格都是x或o
  const isWinner = player => wins.some(combination =>
    combination.every(index => map.flat()[index] === player)
  )
}
```

或者如果你不满足于这种暴力解法，例如你想让你的代码在 `n >> 3`（`n` 为行列数）时也能生效，可以用正常的逻辑判断是否一行、一列、一斜行被同一种棋占满：

```js
const idxs = Array.from({ length: 3 }, (_, i) => i) // [0, 1, 2]
const conditions = [
  // Check rows
  map.some(row => idxs.every(i => row[i] === player)),
  // OR: map.some(row => row.every(cell => cell === player)),
  // Check columns
  idxs.some(i => map.every(row => row[i] === player)),
  // Check main diagonal (top-left to bottom-right)
  idxs.every(i => map[i][i] === player),
  // Check anti-diagonal (top-right to bottom-left)
  idxs.every(i => map[i][map.length - 1 - i] === player)
]

const isWinner = player => conditions.some(condition => condition)
```

注意后三个获胜条件中，我们外层对索引进行遍历。列的获胜条件中，我们在内层固定索引 `i`（即固定取出每行的第几项，即固定某列），然后检查该列的每一项是否都为 `player`。

## 富文本编辑器

题目：<LanqiaoLink name="富文本编辑器" id="18593" />

第一问考查了子组件的 `props` 参数校验，仔细看一下语法：

```js
props: {
    // TODO: 待补充代码 目标 1
    value: {
      required: true,
      type: String,
      default: false,
    },
    options: {
      required: true,
      type: Object,
      default: {
        toolbar: [],
        placeholder: "Insert text here ...",
        readOnly: false,
      },
      validator(option) {
        if (typeof option !== 'object' || option.constructor !== Object)
            throw new Error("options参数格式错误！");
        if (!Array.isArray(option["toolbar"]))
            throw new Error("options参数的toolbar 配置错误！");
      },
    },
},
```

你会注意我们在 `validator` 中检查了一个变量是否为对象和是否为数组。对于检查数组可以直接使用静态方法 `Array.isArray()`，检查对象可以使用 `typeof`。如果你还想确保其不是自定义类或 `Array`、`Date` 等其他内建类型，需要补充一个条件：`obj.constructor === Object`。（实际上本题题干并没有说清楚他想要什么类型，是狭义上的对象还是广义上的对象……）

第二问的难度还是有点大的，我们先看一下大致的框架：

```js
function formatOptions(toolbar) {
  // TODO: 待补充代码 目标 2
  return toolbar.map((cate) => {
    if (typeof cate === 'string') {
      return [toolsMap[cate]]
    }
    else if (Array.isArray(cate) && cate.every(it => typeof it === 'string')) {
      return cate.map(it => toolsMap[it])
    }
    else {
      // TODO
      return null
    }
  })
  // TODO: END
}
```

我们遍历给出的数组的每一项，每一项都有三种可能：

- 如果这一项是字符串，就直接将这个字符串键对应的值取出来并包装成数组返回。这里包装成数组是题目的要求，虽然不尽合理，但是题目已经明确说了。
- 如果这一项是数组，并且数组中的每一项都是字符串，那么就遍历这个数组，将每一项（字符串键）对应的值取出来；最后返回一个数组。
- 前两种的逻辑很简单。对于第三种情况，给出的是一个数组，里面是一个对象：

```json
[
  {
    "header": [1, 2],
    "fontname": ["serif", "cursive", "Monospace"] // ...
  }
]
```

注意到奇怪的地方了吗？这里依然出现了一个意义不明的数组，而且题目并没有明确说明这一点，这就是命题的失误了。

让我们看下这种情况下该如何处理：

```js
function formatOptions(toolbar) {
  // TODO: 待补充代码 目标 2
  return toolbar.map((cate) => {
    if (typeof cate === 'string') {
      return [toolsMap[cate]]
    }
    else if (Array.isArray(cate) && cate.every(it => typeof it === 'string')) {
      return cate.map(it => toolsMap[it])
    }
    else {
      const item = cate[0] // { header: [1, 2] }  /* [!code ++] */
      let entries = Object.entries(item).map(([k, v]) => { /* [!code ++] */
        // k: header
        // v: [1, 2]
        const obj = toolsMap[k] /* [!code ++] */
        obj.options = Object.fromEntries(Object.entries(obj.childrens) /* [!code ++] */
          .filter(([key, _]) => v.map(String).includes(key)) // key: 1 /* [!code ++] */
        ) /* [!code ++] */
        delete obj.childrens /* [!code ++] */
        return [k, obj] /* [!code ++] */
      }) /* [!code ++] */
      return Object.fromEntries(entries) /* [!code ++] */
    }
  })
  // TODO: END
}
```

像这种比较复杂、但是难度又不高的题目，我建议你用函数式编程来做，在每个自己定义的变量旁边标上例子（例如我的注释`k: header; v: [1, 2]`），这样会更容易理解、不容易犯错。

本题中大量使用了 `Object.entries` 和 `Object.fromEntries`，在二维数组和对象之间进行转换。因为只有数组才能实现 `map / filter`等操作。这题还有一个坑是 `header` 数组中 `[1, 2, 3]` 是数值类型，而 `toolsMap` 中的键只能是字符串类型，所以在进行 `includes` 判断前还要进行类型转换。

整体讲一下这一部分的思路：首先我们拿出 `cate` 数组中的第一项（因为我们前面分析过参数是一个只有一个对象的数组）。将这个对象转成二维数组，内层的数组是形如 `['header', [1, 2]]` 的形式。我们通过 `header` 这个键拿到 `toolsMap` 中对应的对象，其中我们需要根据 `childrens` 属性来推出 `options` 属性，再删除 `childrens` 属性。

`options` 属性要从 `childrens` 属性中筛选出数组中的键对应的对象。要对对象的键进行 `filter`，我们还是要把其转成数组。

---

到此为止我们 2024 年的题目就都讲完啦！2024 年的题目整体来讲要更难一些，希望能对你有所帮助！
