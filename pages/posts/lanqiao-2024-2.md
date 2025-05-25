---
title: 蓝桥杯 2024 年国赛题解（二）
date: 2025-05-24T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解😎！

## 新手引导

题目：<LanqiaoLink name="新手引导" id="18586" />

这题的主要难度在于看懂题目和他给的代码。第一问要求我们借助他封装的函数 `getDomWholeRect` 来设置 `introduce` 的样式属性：

```js
introduce.style.top = `${y}px`
if (isLeft) {
  introduce.style.left = `${right + distance}px`
}
else {
  introduce.style.left = `${left - getDomWholeRect(introduce).width - distance}px`
}
```

这里值得注意的是设置样式时要加上单位 `px`，否则样式不会生效。

第二问考察到了一个我之前没听过的方法：`cloneNode`，这个方法可以传入一个布尔值表示是否为深拷贝。第三问很简单只有一行代码：

```js
function copyTarget() {
  //  TODO：待补充代码
  clone = target.cloneNode(true)
  clone.style.position = 'absolute'
  clone.style.width = `${boundingClientRect.width}px`
  clone.style.height = `${boundingClientRect.height}px`
  clone.style.left = `${boundingClientRect.x}px`
  clone.style.top = `${boundingClientRect.y}px`
  clone.style.zIndex = 999
  target.parentElement.append(clone)
  //  TODO：END
}

function removeTarget() {
  //  TODO：待补充代码
  clone?.remove()
  //  TODO：END
}
```

## 简易 WebPack

题目：<LanqiaoLink name="简易 WebPack" id="18588" />

> 此题为 Node.js 代码题，职业组不考察。

第一问要求我们动态替换一个文件中的内容，并写入另一个文件夹中。先看代码：

```js
// Task 1
let entryContent
        = fs.readFileSync(webpack.entry, { encoding: 'utf-8' })
for (let [src, tgt] of Object.entries(webpack.output.resolve.alias)) {
  entryContent = entryContent.replace(src, tgt)
}
// console.log(entryContent);
let outputPath = path.join(webpack.output.path, webpack.output.filename)
fs.writeFileSync(outputPath, entryContent)
```

这里的考点还是很多的：

- 给 `readFileSync` 传入 `{ encoding: 'utf-8' }` 可以让文件内容以字符串的形式返回。
- `Object.entries` 可以将对象转换为一个二维数组，每一项都是一个 `[key, value]` 的数组。
- `fs.writeFileSync` 可以将字符串写入文件。
- 注意 `replace` 是非就地操作，所以需要将结果重新赋值给 `entryContent`。

第二问是一个难度更大的字符串替换：

```js
// Task 2
let indexContent = fs.readFileSync(path.join(__dirname, 'index.html'), { encoding: 'utf-8' })
indexContent = indexContent.replace(/(?<=(src|href)=")(.+?)(?=")/g, (match) => {
  console.log(match)
  return `./${path.join(webpack.output.publicPath, match)}`
})
let indexOutputPath = path.join(webpack.output.path, 'index.html')
fs.writeFileSync(indexOutputPath, indexContent)
```

- 我们在 `replace` 方法中使用了正则表达式和回调函数。正则表达式使用前瞻、后视断言来匹配路径，这样后面的 `replacer` 的第一个参数（完整匹配）就是路径。
- 如果你不想用前后瞻断言，也可以用非捕获组：

  ```js
  indexContent = indexContent.replace(/(?:src|href)="(.+?)"/g, (_, match) => {
    // 这里的 match 位于第二个参数的位置，是第一个捕获组，也就是路径。
  })
  ```

- 注意我们匹配路径的时候始终使用的是 `(.+?)`，其中的 `?` 表示非贪婪匹配，这样可以匹配到最短的路径。
- 注意我们要替换多处字符串，一定不要忘了给正则表达式加上 `g` 标志。
- 实测如果写 `'index.html'` 而不是 `path.join(__dirname, 'index.html')` 会在云端评测时报错，不知道它内部评测的时候是什么环境，保险起见还是写一下。

第三问需要用递归或者 `DFS / BFS` 来遍历文件夹。这种做法我们会在后面的题目中展开讲；这道题有一个天才的做法：

```js
require('node:child_process').execSync(`cp -r ${path.join(__dirname, 'static')} ${webpack.output.path}`)
```

借助命令行工具 `cp` 来复制文件夹，非常巧妙。（这种做法通常依赖评测机是 Unix 系统，所以它只应该在你正常做法做不出来的时候才使用）

## 会议日程

题目：<LanqiaoLink name="会议日程" id="18590" />

前两问都是非常简单的发送请求：

```js
await axios.post('/api/meetings', params)
await axios.delete(`/api/delmeeting/${record.id}`)
```

你会发现之前的题目中没考察过用 `fetch` 发 POST 请求，主要是因为比较麻烦：

```js
fetch('/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(params)
})
```

三四问需要缕清思路：

```js
// 点击单个会议日程
function handleSelect(record) {
  record.checked = !record.checked
  const item = list.value.find(x => x.meetings.includes(record))
  item.meetings.every(({ checked }) => checked) ? handleSelectDate(item) : item.checked = false
}

// 点击日期多选框
function handleSelectDate(item) {
  item.checked = !item.checked
  item.meetings.forEach(x => x.checked = item.checked)
  allCheckStatus.value = list.value.every(({ checked }) => checked)
}

// 点击全选选择框
function handleSelectAll() {
  allCheckStatus.value = !allCheckStatus.value
  list.value.forEach((x) => {
    x.checked = allCheckStatus.value
    x.meetings.forEach(y => y.checked = allCheckStatus.value)
  })
}
```

- 点击单个会议日程 -> 切换该会议的选中状态 -> 找到包含这个会议的日期项 `item`；如果 `item` 中的所有会议都选中了，那么选中 `item`（`handleSelectDate(item)`），否则取消选中 `item`。

- 点击日期的多选框 -> 切换当天的选中状态 -> 选中/取消选中当天的所有会议 -> 同步更新全选框的选中状态。

- 点击全选框 -> 切换全选框的选中状态 -> 选中/取消选中所有日期 -> 选中/取消选中每个日期下的所有会议。

## 代码量统计

题目：<LanqiaoLink name="代码量统计" id="18591" />

这道题我们重点关注最后一问。我简化了题目，修改了一下最后一问的要求，运行这个测试代码：

```js
function testStructDFS() {
  const tree = []

  // 模拟插入路径
  structDFS(tree, ['a', 'b', 'c'], 1)
  structDFS(tree, ['a', 'b', 'd'], 2)
  structDFS(tree, ['a', 'e'], 3)
  structDFS(tree, ['x', 'y'], 4)

  console.log(JSON.stringify(tree, null, 2))
}
```

预期得到的结果如下：

```json
[
  {
    "name": "a",
    "children": [
      {
        "name": "b",
        "children": [
          {
            "name": "c",
            "children": [],
            "value": 1
          },
          {
            "name": "d",
            "children": [],
            "value": 2
          }
        ]
      },
      {
        "name": "e",
        "children": [],
        "value": 3
      }
    ]
  },
  {
    "name": "x",
    "children": [
      {
        "name": "y",
        "children": [],
        "value": 4
      }
    ]
  }
]
```

将路径转换为树形结构，并设置树形结构的最末级节点的 `value` 值。我们要想办法编写 `structDFS` 函数：

```js
function structDFS(rootNodes, names, value) {
  const stack = [{ siblings: rootNodes, names }]

  while (stack.length) {
    const { siblings, names } = stack.pop()

    const curr = names.shift()

    let node = siblings.find(n => n.name === curr)

    if (!node) {
      node = { name: curr, children: [] }
      siblings.push(node)
    }

    if (names.length === 0) {
      node.value = value
    }
    else {
      stack.push({ siblings: node.children, names })
    }
  }
}
```

我们使用 **深度优先** 的遍历策略，维护一个栈，栈中元素是**当前待处理的 `names` 和其同级节点的数组 `siblings`**（我们要把新节点塞进这个数组里）：

```js
function structDFS(rootNodes, names, value) {
  const stack = [{ siblings: rootNodes, names }]

  while (stack.length) {
    // TODO
  }
}
```

每次从栈中取出一个元素，将其 `names` 的第一个元素取出，作为我们本次循环中要处理的 `name`：

```js
while (stack.length) {
  const { siblings, names } = stack.pop() /* [!code ++] */
  const curr = names.shift() /* [!code ++] */
}
```

当前同级列表 `siblings` 中，可能存在 `curr`，也可能不存在（例如我们只存入了`[a, b, c]`, 现在有了新的`[d, e, f]`，此时 `siblings` 中只有 `a`，没有 `d`）。对于不存在的情况，我们要手动构造一个节点并放入 `siblings` 中：

```js
while (stack.length) {
  const { siblings, names } = stack.pop()
  const curr = names.shift()
  let node = siblings.find(n => n.name === curr) /* [!code ++] */
  if (!node) { /* [!code ++] */
    node = { name: curr, children: [] } /* [!code ++] */
    siblings.push(node) /* [!code ++] */
  } /* [!code ++] */
}
```

现在我们已经构造好了节点并加入了 `siblings`（事实上这行是递归中实际的操作），接着只需要决定是否要继续递归即可：

- 如果 `names` 中还有元素，说明当前节点不是最末级节点，需要继续递归；
- 如果 `names` 中没有元素，说明当前节点是最末级节点，需要设置 `value`。

```js
while (stack.length) {
  const { siblings, names } = stack.pop()
  const curr = names.shift()
  let node = siblings.find(n => n.name === curr)
  if (!node) {
    node = { name: curr, children: [] }
    siblings.push(node)
  }
  if (names.length === 0) { /* [!code ++] */
    node.value = value /* [!code ++] */
  }
  else { /* [!code ++] */
    stack.push({ siblings: node.children, names }) /* [!code ++] */
  }
}
```

事实上，DFS（维护一个栈）和 BFS（维护一个队列）仅在遍历树时的顺序不同，其余的逻辑是一样的。像在本题中，我们不关心遍历的顺序，所以可以非常简单地把 DFS 改成 BFS：

```js
function structBFS(rootNodes, names, value) {
  const stack = [{ siblings: rootNodes, names }]; /* [!code --] */
  const queue = [{ siblings: rootNodes, names }]; /* [!code ++] */
  while (stack.length) {
    const { siblings, names } = stack.pop(); /* [!code --] */
    const { siblings, names } = queue.shift(); /* [!code ++] */
    const curr = names.shift();

    let node = siblings.find(n => n.name === curr);

    if (!node) {
      node = { name: curr, children: [] };
      siblings.push(node);
    }

    if (names.length === 0) {
      node.value = value;
    } else {
      stack.push({ siblings: node.children, names }); /* [!code --] */
      queue.push({ siblings: node.children, names }); /* [!code ++] */
    }
  }
}
```

掌握这种思想，就可以解决很多题目了！

> 思考题：怎么把题目中的树形结构递归地转成如下这种结构：
>
> ```json
> [
>   {
>     "a": [
>       {
>         "b": [
>           { "c": 1 },
>           { "d": 2 }
>         ]
>       },
>       { "e": 3 }
>     ]
>   },
>   {
>     "x": [
>       { "y": 4 }
>     ]
>   }
> ]
> ```
