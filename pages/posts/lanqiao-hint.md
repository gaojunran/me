---
title: 蓝桥杯国赛赛前必读 —— 一些小提示！
date: 2025-06-14T00:00:00Z
lang: zh
duration: 10min
---

1. 文本框内的内容属性是`value`而不是`textContent`。如果要看其它 HTML 中原生控件的属性，可以用 `console.dir` 来查看。

2. `>` 表示直接子元素，空格表示后代元素；`+` 表示相邻紧跟的兄弟元素，`~` 表示所有兄弟元素。如果考场上突然忘了 CSS 选择器怎么用，可以给 HTML 应该匹配上的元素自己手动加一个 class。

3. 除了改动 `innerHTML` 之外，JavaScript DOM API 给了两个方法 `replaceWith` 和 `replaceChildren` 可以改动一个元素的子元素。这个我在省赛的视频中漏讲了，实际非常好用。

4. 通过 `ref(null)` 拿到的组件实例，也需要通过 `.value` 获取其实例。

5. `toFixed(2)` 可以给 number 类型转成字符串并指定保留小数的位数。在显示商品价格的场景中，务必用字符串而不是浮点数（因为浮点数可能会有精度问题，可能导致显示出 `0.30000000002` 而评测不过）

6. 再次复习一下随机数如何生成：

```js
Math.random() * (max - min) + min
```

7. 使用链式 `then` 调用来使用 `fetch`：

```js
fetch('./data.json').then(res => res.json()).then((res) => {
  // console.log(res);
})
```

8. 如果你忘记了某个 API 中的回调函数应该传什么参数，不妨这样写：

```js
someFunction((...args) => console.log(args))
```

可以打印出回调函数给你提供的各个参数。

9. 正则表达式在查找的正则中引用组的语法是 `\1, \2, \3`，在替换的字符串中引用组的语法是 `$1, $2, $3`。

10. fs.readFileSync默认返回的是Buffer，如果想要得到字符串需要用utf8参数指定编码。

11. structuredClone 可以深克隆一个对象。JSON.parse(JSON.stringify(obj)) 是一个平替。

12. 和 Vue 2 不同，Vue 3 中 `v-if` 的优先级高于 `v-for`。在考场上可以使用这个优先级顺序，在实际工程中不建议，建议用 `<template>` 包裹一层这个组件。

13. `grid-template-columns` 和 `grid-template-rows` 可以指定父元素中子元素的网格排布；``grid-template-areas` 没有定义子元素的排列，只是给子元素的排列进行了命名（通常没有必要用）。`grid-column` 和 `grid-row` 和 `grid-area` 可以指定子元素在网格中的位置。

14. 使用 `await` 调用 `fetch`，一口气写完不错误处理：

```js
const data = await (await fetch(MockUrl)).json()
```

15. Pinia 中定义的响应式变量不需要调用 `.value` 就能使用。

16. 给元素的 `style` 赋值要加上单位。通过 `window.getComputedStyle` 可以得到元素的最终样式，同样是带单位的。

17. `Element.cloneNode` 可以复制一个元素，可以传入 `true` 表示深复制。

18. `String.replace` 方法可以传入 `replacer` 函数，其参数为 `match, p1, p2, ...`，其中 `match` 是匹配到的字符串，`p1, p2, ...` 是正则中匹配到的组。

19. 注意使用正则表达式时是否需要加标志，是否需要多行 `m` 标志，是否需要全局 `g` 标志。

20. 一个典型的使用 `fetch` 发 POST 请求的例子：

```js
fetch('/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(params)
})
```

21. Vue 中 `props` 参数校验的语法：

```js
value: {
  required: true,
  type: String,
  default: false,
  validator: (value) => {
    return ['true', 'false'].includes(value)
  }
},
```

22. 建议类数组对象、Object、Set 等都先转成数组再使用数组上的方法，能大幅度减少出错率。

23. 要注意不要忘记在 `map`、`reduce` 的回调函数中返回值。

24. 将 `flex-wrap` 设为 `wrap` 之后，就可以使用 `align-content` 来控制多行时的对齐方式。

25. 很多 DOM API 得到的类数组对象都是只读的，如果修改不会生效。需要调用专门的方法来修改，如 `removeChild`，`replaceWith` 等。

---

🎉 预祝大家国赛顺利！
