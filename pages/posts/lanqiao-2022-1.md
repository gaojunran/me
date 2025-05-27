---
title: 蓝桥杯 2022 年国赛题解（一）
date: 2025-05-27T00:00:00Z
lang: zh
duration: 12min
type: note
---

[[toc]]

> [!TIP]
> 建议先刷题，再看题解！😎

## 分一分

题目：<LanqiaoLink name="分一分" id="2438" />

这题比较简单，应该在几分钟内做完。要求我们将一个数组排序，并按照 `num` 来分割。

首先给数组按数值大小排序：

```js
function splitArray(oldArr, num) {
  // TODO：请补充代码实现功能
  return oldArr.sort((a, b) => a - b) // TODO
}
```

注意，`sort` 的默认实现是按照字符串的字典序排序，所以如果按数值大小排序，需要传入一个比较函数。

接着，我们按照 `num` 来分割数组：基本思路是，我们可以遍历原数组来构造一个新数组，分为两种情况：

- 当新数组最后一个子数组的长度小于 `num` 时，直接将当前元素添加到新数组的最后一个子数组中。
- 当新数组最后一个子数组的长度等于 `num` 时，我们新建一个只含有当前元素的子数组，添加到新数组中。

这种需求非常适合用 `reduce` 来实现，具体代码如下：

```js
function splitArray(oldArr, num) {
  // TODO：请补充代码实现功能
  return oldArr.sort((a, b) => a - b).reduce((acc, cur) => {
    if (acc[acc.length - 1].length < num) {
      acc[acc.length - 1].push(cur)
      return acc
    }
    else {
      acc.push([cur])
      return acc
    }
  }, [])
}
```

要注意不要忘记在 `reduce` 的回调函数中返回值（`return acc`），否则下一轮循环 `acc` 就变成空值了。

上面的代码是有问题的。试着找找问题在哪？

在第一轮的时候，`acc` 是一个空数组，所以 `acc[acc.length - 1]` 会报错。我们可以有两种做法来修正：

第一种方法是，在判断 `acc[acc.length - 1].length < num` 之前做一个逻辑短路：

```js
if (acc[acc.length - 1].length < num) { /* ... */ } /* [!code --] */
if (acc.length !== 0 && acc[acc.length - 1].length < num) { /* ... */ } /* [!code ++] */
```

这样第一轮循环时，就会进 `else` 分支，新建一个子数组。

第二种方法更为简单，直接给 `acc` 的初始值设为 `[[]]` 而不是 `[]`，来规避第一轮的问题。

## 新鲜的蔬菜

题目：<LanqiaoLink name="新鲜的蔬菜" id="2439" />

这道题使用 `grid` 是更加直观的：

```css
.box {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
}
#box1 > .item {
  grid-area: 2 / 2;
}
#box2 .item:nth-child(2) {
  grid-area: 3 / 3;
}
#box3 .item:nth-child(2) {
  grid-area: 2 / 2;
}
#box3 .item:nth-child(3) {
  grid-area: 3 / 3;
}
```

前面的题目中我们已经具体介绍了 `grid-template-columns` 等属性的使用方法，在此不再赘述。

思考一下这题可以用 `flex` 来实现吗？

```css
.box {
  display: flex;
}
#box1 {
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
#box2 {
  justify-content: space-between;
}
#box2 .item:nth-child(2) {
  align-self: end;
}
#box3 {
  justify-content: space-between;
}
#box3 .item:nth-child(2) {
  align-self: center;
}
#box3 .item:nth-child(3) {
  align-self: end;
}
```

这是题解区一个同学的答案。你可能会思考，主轴方向和交叉轴方向明明逻辑一样，为什么一个可以用 `justify-content` 来实现，另一个要给子元素分别用 `align-self` 来实现呢？

事实上我们不常用 `flex` 的 `align-content` 属性，但是它是能用的！只要给 `flex-wrap` 设为 `wrap`，`align-content` 就能生效了。所以我们可以这样写（甚至可以用 `place-content` 来进一步简化代码）：

```css
.box {
  display: flex;
  flex-wrap: wrap;
}
#box1 {
  flex-direction: row;
  align-items: center;
  justify-content: center;
}
#box2 {
  justify-content: space-between;
  align-content: space-between;
}

#box3 {
  justify-content: space-between;
  align-content: space-between;
}
```

不过这种做法通不过评测，但是实现的效果是一样的。😂

## 水果消消乐

题目：<LanqiaoLink name="水果消消乐" id="2440" />

不愧是国赛，第三道就弄了一道比较麻烦的题！

首先先定义几个辅助函数：

```js
function showCard(box) {
  box.firstElementChild.style.display = 'block'
}

function hideCard(box) {
  box.firstElementChild.style.display = 'none'
}

function removeCard(box) {
  box.style.visibility = 'hidden'
  hideCard(box)
}

function updateScore(value) {
  const scoreNode = document.querySelector('#score')
  scoreNode.textContent = String(+scoreNode.textContent + value)
}
```

注意 `updateScore` 中，我们需要处理 `scoreNode.textContent` 是字符串的情况，所以需要用 `+` 来将其转为数值。还有我们要隐藏一个元素时，要根据**其是否保留在页面布局中**来选择 `visibility: hidden` 和 `display: none` 属性。这两个属性更详细的区别可以看这篇[文章](https://medium.com/@narayanansundar02/difference-between-display-none-visibility-hidden-and-opacity-0-in-css-b8630d58540c)。

接着看一下游戏的主逻辑：

```js
function startGame() {
  const flipped = [] // 使用数组更清晰处理顺序
  let canClick = true // 控制点击节流
  document.querySelector('#start').style.display = 'none'

  document.querySelectorAll('.img-box').forEach((box) => {
    box.addEventListener('click', function () {
      if (!canClick || flipped.includes(this) || this.style.visibility === 'hidden')
        return

      showCard(this)
      flipped.push(this)

      if (flipped.length === 2) {
        canClick = false
        const [first, second] = flipped

        const firstImg = first.firstElementChild
        const secondImg = second.firstElementChild

        const isMatch = firstImg.src === secondImg.src

        setTimeout(() => {
          if (isMatch) {
            removeCard(first)
            removeCard(second)
            updateScore(2)
          }
          else {
            hideCard(first)
            hideCard(second)
            updateScore(-2)
          }
          flipped.length = 0 // 清空数组
          canClick = true
        }, 600) // 增加延迟
      }
    })
  })
}
```

点击一张图片后，代码会按如下逻辑执行：

- 如果上一次点击动画还没结束 / 当前图片当前是翻开的状态 / 当前图片已经被移除了，就不执行任何操作。
- 如果不是如上的三种情况，就显示图片，并添加到 `flipped` 数组中。（`flipped` 数组用来记录当前翻开的图片，最多只会有两张照片）
- 如果翻开的图片数达到两张，就进入匹配逻辑。如果两张照片匹配，就移除它们；否则就隐藏它们。然后清空 `flipped` 数组。从翻开图片到移除 / 隐藏图片的时间内，保持 `canClick` 为 `false`，防止用户在这段时间内点击其他图片。

这个 600ms 的延迟是为了让用户能看清两张图片是否匹配。实际上为了通过评测，这个时间可以更短甚至为 0。

想完整地考虑所有情况还是需要一些谨慎的思考的。

## 用什么来做计算

题目：<LanqiaoLink name="用什么来做计算" id="2441" />

这题有点抽象，让我们计算一个带括号的四则运算表达式。

手写语法解析？不可能的！（事实上题解区都没人手写）用下 `eval` 吧！

```js
const calculator = document.querySelector('.calculator')
const formula = document.getElementById('formula')
const result = document.getElementById('result')
calculator.addEventListener('click', (e) => {
  if (e.target.className === 'calc-button') {
    switch (e.target.textContent) {
      case '=':
        // eslint-disable-next-line no-eval
        result.value = eval(formula.value.replaceAll('x', '*').replaceAll('÷', '/'))
        break
      case '√':
        result.value = Math.sqrt(Number.parseFloat(formula.value))
        break
      case 'AC':
        formula.value = ''
        result.value = ''
        break
      default:
        formula.value += e.target.textContent
    }
  }
})
```

当按下 `=` 时，表示应该得出结果。我们应该把表达式的 `x` 和 `÷` 替换为 `*` 和 `/`。然后调用 `eval` 评估 JavaScript 表达式计算出结果。

按下 `√` 时，表示应该计算当前表达式的平方根（此功能下表达式 `formula` 限定为一个值），并直接得出结果。

按下 `AC` 时，表示应该清空输入框。

按下除此之外的其它键时，表示应该将当前按键的值添加到输入框中。
